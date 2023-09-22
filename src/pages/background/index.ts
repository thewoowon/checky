import "regenerator-runtime/runtime.js";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { SlotStorage } from "@pages/background/lib/storage/slotStorage";
import { ApiKeyStorage } from "@pages/background/lib/storage/apiKeyStorage";
import { chatGPT } from "@pages/background/lib/infra/chatGPT";
import Logger from "@pages/background/lib/utils/logger";
import {
  sendErrorMessageToClient,
  sendMessageToClient,
} from "@src/chrome/message";
import { QuickChatHistoryStorage } from "@pages/background/lib/storage/quickChatHistoryStorage";
import { exhaustiveMatchingGuard } from "@src/shared/ts-utils/exhaustiveMatchingGuard";
import { createNewChatGPTSlot } from "@src/shared/slot/createNewChatGPTSlot";
import { PROMPT_GENERATE_PROMPT } from "@src/constant/promptGeneratePrompt";
import { ChatHistoryStorage } from "@pages/background/lib/storage/chatHistoryStorage";
import { AccessTokenStorage } from "./lib/storage/accessTokenStorage";
import { checkyGPT } from "./lib/infra/checkyGPT";

reloadOnUpdate("pages/background");

type RequiredDataNullableInput<T extends Message> = {
  type: T["type"];
  input?: unknown;
  data: Exclude<T["data"], undefined>;
};

chrome.runtime.onInstalled.addListener(async function () {
  //checkCommandShortcuts();

  // Create one test item for each context type.
  const contexts: chrome.contextMenus.ContextType[] = ["link", "video"];
  for (let i = 0; i < contexts.length; i++) {
    const context = contexts[i];
    const title = `체키로 ${context === "video" ? "비디오" : "링크"} 분석하기`;
    chrome.contextMenus.create({
      title: title,
      contexts: [context],
      id: context,
    });
  }
  chrome.runtime.openOptionsPage();
});

async function addIframe() {
  // 현재 커서의 clientX, clientY를 가져온다.
  const { clientX, clientY } = await new Promise<MouseEvent>((resolve) => {
    document.addEventListener("click", (e) => {
      resolve(e);
    });
  });

  // 현재 커서의 clientX, clientY를 기준으로 element를 가져온다.
  const element = document.elementFromPoint(clientX, clientY) as HTMLElement;

  // element의 위치를 가져온다.
  const rect = element.getBoundingClientRect();

  // iframe을 생성한다.
  const iframe = document.createElement("iframe");

  // iframe의 위치를 설정한다.
  iframe.style.position = "fixed";
  iframe.style.top = `${rect.top}px`;
  iframe.style.left = `${rect.left}px`;
  iframe.style.width = `${400}px`;
  iframe.style.height = `${300}px`;
  iframe.style.zIndex = (
    Number.MAX_SAFE_INTEGER - 1
  ).toString() /* 최상위 레이어 */;
  iframe.style.border = "none";

  // iframe을 body에 추가한다.
  document.body.appendChild(iframe);

  // iframe의 src를 설정한다.
  iframe.src = chrome.runtime.getURL("pages/content/index.html");

  // iframe의 load가 완료될 때까지 기다린다.
  await new Promise((resolve) => {
    iframe.addEventListener("load", resolve);
  });

  // iframe의 load가 완료되면 iframe을 제거한다.
  //iframe.remove();

  // iframe의 contentWindow를 가져온다.
  const contentWindow = iframe.contentWindow;

  // iframe의 contentWindow가 없으면 종료한다.
  if (!contentWindow) {
    return;
  }

  // iframe의 contentWindow에 메시지를 보낸다.
  //   contentWindow.postMessage(
  //     {
  //       type: "message",
  //       data: {
  //         type: "prompt",
  //         data: {
  //           prompt: "prompt",
  //         },
  //       },
  //     },
  //     "*"
  //   );

  //   // iframe의 contentWindow로부터 메시지를 받는다.
  //   window.addEventListener("message", (e) => {
  //     console.log(e);
  //   });
}

// chrome.contextMenus.onClicked.addListener(async function (info, tab) {
//   chrome.scripting
//     .executeScript({
//       target: { tabId: tab?.id ?? 0, allFrames: true },
//       func: addIframe,
//     })
//     .then((injectionResults) => {
//       for (const frameResult of injectionResults) {
//         const { frameId, result } = frameResult;
//         console.log(`Frame ${frameId} result:`, result);
//       }
//     });
// });

function contentScriptFunc(name: string) {
  const cursor = document.body.style.cursor;
  if (cursor === "pointer" || cursor === "default") {
    const cursorUrl = chrome.runtime.getURL("checky-hand-64.png");
    document.body.style.cursor = `url(${cursorUrl}) , auto`;
  } else {
    document.body.style.cursor = "default";
  }
}

async function checkCommandShortcuts() {
  chrome.commands.getAll((commands) => {
    const missingShortcuts = [];

    for (const { name, shortcut } of commands) {
      if (shortcut === "") {
        missingShortcuts.push(name);
      } else {
        console.log(name, shortcut);
      }
    }

    if (missingShortcuts.length > 0) {
      // Update the extension UI to inform the user that one or more
      // commands are currently unassigned.
    }
  });
}

// chrome.commands.onCommand.addListener((command) => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const tabId = tabs[0].id;
//     if (tabId) {
//       chrome.scripting.executeScript({
//         target: { tabId },
//         func: contentScriptFunc,
//         args: ["command"],
//       });
//     }
//   });
// });

chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    console.log("Port disconnected");
  });
  port.onMessage.addListener(async (message: Message) => {
    Logger.receive(message);

    const sendResponse = <M extends Message>(
      message: RequiredDataNullableInput<M>
    ) => {
      Logger.send(message);
      sendMessageToClient(port, message);
    };

    try {
      switch (message.type) {
        case "GetSlots": {
          const slots = await SlotStorage.getAllSlots();
          /** add default slot when initialize */
          if (slots.length === 0) {
            const defaultSlot = createNewChatGPTSlot({ isSelected: true });
            await SlotStorage.addSlot(defaultSlot);
            slots.push(defaultSlot);
          }
          sendResponse({ type: "GetSlots", data: slots });
          break;
        }
        case "AddNewSlot": {
          await SlotStorage.addSlot(message.input);
          sendResponse({ type: "AddNewSlot", data: "success" });
          break;
        }
        case "SelectSlot": {
          const slots = await SlotStorage.getAllSlots();
          const updatedSlots = slots.map((slot) => ({
            ...slot,
            isSelected: message.input === slot.id,
          }));
          await SlotStorage.setAllSlots(updatedSlots);
          sendResponse({ type: "SelectSlot", data: updatedSlots });
          break;
        }
        case "UpdateSlot": {
          const slots = await SlotStorage.updateSlot(message.input);
          sendResponse({ type: "UpdateSlot", data: slots });
          break;
        }
        case "DeleteSlot": {
          const slots = await SlotStorage.deleteSlot(message.input);
          sendResponse({ type: "DeleteSlot", data: slots });
          break;
        }
        case "GetAPIKey": {
          const apiKey = await ApiKeyStorage.getApiKey();
          sendResponse({ type: "GetAPIKey", data: apiKey });
          break;
        }
        case "SaveAPIKey":
          await chatGPT({
            input: "hello",
            apiKey: message.input,
            slot: { type: "ChatGPT" },
          }).catch((error) => {
            ApiKeyStorage.setApiKey(null);
            throw error;
          });
          await ApiKeyStorage.setApiKey(message.input);
          sendResponse({ type: "SaveAPIKey", data: "success" });
          break;
        case "ResetAPIKey":
          await ApiKeyStorage.setApiKey(null);
          sendResponse({ type: "ResetAPIKey", data: "success" });
          break;
        case "RequestInitialDragGPTStream": {
          const slot = await SlotStorage.getSelectedSlot();
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            input: message.input,
            slot,
            apiKey,
            onDelta: (chunk) => {
              sendResponse({
                type: "RequestInitialDragGPTStream",
                data: {
                  result: "",
                  chunk,
                },
              });
            },
          });
          sendResponse({
            type: "RequestInitialDragGPTStream",
            data: {
              isDone: true,
              result: response.result,
            },
          });
          break;
        }
        case "RequestOnetimeChatGPT": {
          const selectedSlot = await SlotStorage.getSelectedSlot();
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            input: message.input,
            slot: selectedSlot,
            apiKey,
          });
          sendResponse({
            type: "RequestOnetimeChatGPT",
            data: response,
          });
          break;
        }
        case "RequestQuickChatGPTStream": {
          await QuickChatHistoryStorage.pushChatHistories({
            role: "user",
            content: message.input?.messages.at(-1)?.content ?? "",
            isUrl: "text",
          });
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            chats: message.input?.messages,
            slot: { type: message.input?.isGpt4 ? "ChatGPT4" : "ChatGPT" },
            apiKey,
            onDelta: (chunk) => {
              sendResponse({
                type: "RequestQuickChatGPTStream",
                data: {
                  result: "",
                  chunk,
                },
              });
            },
          });
          await QuickChatHistoryStorage.pushChatHistories({
            role: "assistant",
            content: response.result,
            isUrl: "text",
          });
          sendResponse({
            type: "RequestQuickChatGPTStream",
            data: { result: response.result, isDone: true },
          });
          break;
        }
        case "RequestCheckyChatGPT": {
          await QuickChatHistoryStorage.pushChatHistories({
            role: "user",
            content: message.input?.messages.at(-1)?.content ?? "",
            isUrl: "text",
          });
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await checkyGPT({
            chats: message.input?.messages,
            slot: { type: message.input?.isGpt4 ? "ChatGPT4" : "ChatGPT" },
            apiKey,
            onDelta: (chunk) => {
              sendResponse({
                type: "RequestCheckyChatGPT",
                data: {
                  result: "",
                  chunk,
                },
              });
            },
          });
          await QuickChatHistoryStorage.pushChatHistories({
            role: "assistant",
            content: response.summaryResult,
            isUrl: "url",
          });
          sendResponse({
            type: "RequestCheckyChatGPT",
            data: { result: response.summaryResult, isDone: true },
          });
          break;
        }
        case "RequestDragGPTStream": {
          const apiKey = await ApiKeyStorage.getApiKey();
          const slot = await SlotStorage.getSelectedSlot();
          const response = await chatGPT({
            chats: message.input?.chats,
            slot: { type: slot.type },
            apiKey,
            onDelta: (chunk) => {
              sendResponse({
                type: "RequestDragGPTStream",
                data: {
                  result: "",
                  chunk,
                },
              });
            },
          });
          sendResponse({
            type: "RequestDragGPTStream",
            data: { result: response.result, isDone: true },
          });
          break;
        }
        case "RequestOngoingChatGPT": {
          const selectedSlot = await SlotStorage.getSelectedSlot();
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            chats: message.input,
            slot: selectedSlot,
            apiKey,
          });
          sendResponse({ type: "RequestOngoingChatGPT", data: response });
          break;
        }
        case "RequestGenerateChatGPTPrompt": {
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            input: message.input,
            slot: {
              type: "ChatGPT",
              system: PROMPT_GENERATE_PROMPT,
            },
            apiKey,
          });
          sendResponse({
            type: "RequestGenerateChatGPTPrompt",
            data: response,
          });
          break;
        }
        case "GetQuickChatHistory": {
          const chats = await QuickChatHistoryStorage.getChatHistories();
          sendResponse({ type: "GetQuickChatHistory", data: chats });
          break;
        }
        case "ResetQuickChatHistory": {
          await QuickChatHistoryStorage.resetChatHistories();
          sendResponse({ type: "ResetQuickChatHistory", data: "success" });
          break;
        }
        case "PushChatHistory": {
          await ChatHistoryStorage.pushChatHistories(
            message.input.sessionId,
            message.input.chats
          );
          sendResponse({ type: "PushChatHistory", data: "success" });
          break;
        }
        case "SaveChatHistory": {
          await ChatHistoryStorage.saveChatHistories(
            message.input.sessionId,
            message.input.chats,
            message.input.type
          );
          sendResponse({ type: "SaveChatHistory", data: "success" });
          break;
        }
        case "DeleteChatHistorySession": {
          await ChatHistoryStorage.deleteChatHistory(message.input);
          sendResponse({ type: "DeleteChatHistorySession", data: "success" });
          break;
        }
        case "DeleteAllChatHistory": {
          await ChatHistoryStorage.resetChatHistories();
          sendResponse({ type: "DeleteAllChatHistory", data: "success" });
          break;
        }
        case "GetAllChatHistory": {
          sendResponse({
            type: "GetAllChatHistory",
            data: await ChatHistoryStorage.getChatHistories(),
          });
          break;
        }
        case "GetChatSessionHistory": {
          sendResponse({
            type: "GetChatSessionHistory",
            data: await ChatHistoryStorage.getChatHistory(message.input),
          });
          break;
        } // GetAccessToken | ResetAccessToken | SaveAccessToken'
        case "GetAccessToken": {
          sendResponse({
            type: "GetAccessToken",
            data: await AccessTokenStorage.getAccessToken(),
          });
          break;
        }
        case "ResetAccessToken": {
          await AccessTokenStorage.resetAccessToken();
          sendResponse({ type: "ResetAccessToken", data: "success" });
          break;
        }
        case "SaveAccessToken": {
          await chatGPT({
            input: "hello",
            apiKey: message.input,
            slot: { type: "ChatGPT" },
          }).catch((error) => {
            ApiKeyStorage.setApiKey(null);
            throw error;
          });
          await ApiKeyStorage.setApiKey(message.input);
          sendResponse({ type: "SaveAPIKey", data: "success" });
          break;
        }
        default: {
          exhaustiveMatchingGuard(message);
        }
      }
    } catch (error) {
      Logger.warn(error);
      sendErrorMessageToClient(port, error);
    }
  });
});
