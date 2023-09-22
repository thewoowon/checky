import { FormEventHandler, useEffect } from "react";
import { BoxProps } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import ChatText from "@src/shared/component/ChatText";
import AssistantChat from "@src/shared/component/AssistantChat";
import UserChat from "@src/shared/component/UserChat";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import { t } from "@src/chrome/i18n";
import { getDragGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";
import { getCheckyGPTResponse } from "@src/shared/services/getCheckyResponse";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import useGeneratedId from "@src/shared/hook/useGeneratedId";
import { COLORS } from "@src/constant/style";
import FixedMessageBox, { FixedMessageBoxProps } from "./FixedMessageBox";
import TagContainer from "../Tags";
import parse from "html-react-parser";
import { TagObject } from "../Tags/TagContainer";
import checkyStreamChatStateMachine from "@src/shared/xState/checkyStreamChatStateMachine";
import WordCloud from "../WordCloud";

type FixedResponseMessageBoxProps = Omit<
  FixedMessageBoxProps,
  "header" | "width" | "footer" | "content"
> & {
  initialChats: Chat[];
  dragLink: string | null;
};

export default function FixedResponseMessageBox({
  initialChats,
  onClose,
  dragLink,
}: FixedResponseMessageBoxProps) {
  const { id: sessionId } = useGeneratedId("checky_");
  const [state, send] = useMachine(checkyStreamChatStateMachine, {
    services: {
      getChatHistoryFromBackground: async () => {
        void sendMessageToBackgroundAsync({
          type: "SaveChatHistory",
          input: { sessionId, chats: initialChats, type: "Drag" },
        });
        return initialChats;
      },
      getGPTResponse: (context) => {
        void sendMessageToBackgroundAsync({
          type: "PushChatHistory",
          input: { sessionId, chats: context.chats.at(-1) as Chat },
        });
        return new Promise((resolve, reject) => {
          getDragGPTResponseAsStream({
            input: { chats: context.chats, sessionId },
            onDelta: (chunk) => {
              send("RECEIVE_ING", { data: chunk });
              resolve({
                firstChunk: chunk,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
            onFinish: (result) => {
              send("RECEIVE_DONE", { data: result });
              void sendMessageToBackgroundAsync({
                type: "PushChatHistory",
                input: {
                  sessionId,
                  chats: { role: "assistant", content: result, isUrl: "text" },
                },
              });
              resolve({
                firstChunk: result,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
          });
        });
      },
      getCheckyResponse: (context) => {
        void sendMessageToBackgroundAsync({
          type: "PushChatHistory",
          input: { sessionId, chats: context.chats.at(-1) as Chat },
        });
        return new Promise((resolve, reject) => {
          getCheckyGPTResponse({
            isGpt4: context.isGpt4,
            messages: context.chats,
            onDelta: (chunk) => {
              send("RECEIVE_ING", { data: chunk });
              resolve({
                firstChunk: chunk,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
            onFinish: (result) => {
              send("RECEIVE_DONE", { data: result });
              void sendMessageToBackgroundAsync({
                type: "PushChatHistory",
                input: {
                  sessionId,
                  chats: {
                    role: "assistant",
                    content: result,
                    isUrl: "url",
                  },
                },
              });
              resolve({
                firstChunk: result,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
          });
        });
      },
    },
    actions: {
      exitChatting: onClose,
    },
  });

  /** 첫 번째 질문 숨김처리 (드래깅으로 질문) */
  const [, ...chats] = state.context.chats;
  const isLoading = state.matches("loading");
  const isLoadingUrl = state.matches("loading_url");
  const isReceiving = state.matches("receiving");

  const { scrollDownRef } = useScrollDownEffect([chats.at(-1)?.content]);
  const { isCopied, copy } = useCopyClipboard([
    chats.filter(({ role }) => role === "assistant").length,
  ]);

  const onClickStopButton = () => {
    send("RECEIVE_CANCEL");
  };

  const onClickCopy = async () => {
    const lastResponseText = findLastResponseChat(chats);
    if (lastResponseText) {
      await copy(lastResponseText.content);
    }
  };
  // TODO refactor
  const lastResponseIndex: number = (() => {
    if (isLoading) {
      return chats.length - 2;
    }
    return chats.length - 1;
  })();

  const isUrl = (url: string) => {
    const regExp = new RegExp(
      "^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$"
    );
    return regExp.test(url);
  };

  const onChatSubmit: FormEventHandler = (event) => {
    event.preventDefault();

    if (isUrl(state.context.inputText)) {
      send({ type: "QUERY_URL", data: true });
    } else {
      send({ type: "QUERY", data: false });
    }
  };

  useEffect(() => {
    console.log("dragLink in", dragLink);
    if (dragLink) {
      send({ type: "CHANGE_TEXT", data: dragLink });
      send({ type: "QUERY_URL", data: true });
    }
  }, [dragLink]);

  return (
    <FixedMessageBox
      header={
        <header
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%;",
            height: "24px",
            color: "black",
            fontWeight: "bold",
            cursor: "move",
          }}
        >
          {t("responseFixedMessageBox_responseTitle")}
        </header>
      }
      onClose={() => send("EXIT")}
      width={372}
      content={
        <div
          ref={scrollDownRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            paddingTop: "8px",
            color: "#000000",
            maxHeight: "400px",
            width: "100%",
            overflowY: "scroll",
            height: "100%",
          }}
        >
          {chats.map((chat, index) => (
            <CheckyChatBox
              key={index}
              chat={chat}
              isWordCloud={state.context.isWordCloud}
            />
          ))}
        </div>
      }
      footer={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            paddingTop: "8px",
            color: "#000000",
          }}
        >
          <form
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "4px",
            }}
            onSubmit={onChatSubmit}
          >
            <input
              style={{
                width: "100%",
                color: "black",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                padding: "2px",
              }}
              value={state.context.inputText || ""}
              placeholder={t("responseMessageBox_messageInputPlacepolder")}
              onChange={(e) =>
                send({ type: "CHANGE_TEXT", data: e.target.value })
              }
              onKeyDown={(e) => e.stopPropagation()}
            />

            <button
              style={{
                minWidth: "48px",
                padding: "4px",
                borderRadius: "4px",
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "10px",
                color: COLORS.WHITE,
                backgroundColor: COLORS.PRIMARY,
              }}
            >
              {isLoading || isLoadingUrl || isReceiving
                ? "loading"
                : t("responseMessageBox_sendButtonText")}
            </button>
          </form>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
              gap: "4px",
              padding: "6px 0px",
            }}
          >
            <button
              style={{
                borderRadius: "4px",
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                color: COLORS.WHITE,
                backgroundColor: COLORS.PRIMARY,
                padding: "4px 6px",
              }}
              onClick={onClickCopy}
            >
              {isCopied
                ? t("responseMessageBox_copyButtonText_copied")
                : t("responseMessageBox_copyButtonText_copy")}
            </button>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {/* // check box를 멋지게 꾸며줘 */}
              <input
                type="checkbox"
                checked={state.context.isGpt4}
                onChange={(e) => {
                  send({ type: "TOGGLE_IS_GPT4" });
                }}
              />
              <label
                style={{
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                GPT 4
              </label>
              <input
                type="checkbox"
                checked={state.context.isWordCloud}
                onChange={(e) => {
                  send({ type: "TOGGLE_WORD_CLOUD" });
                }}
              />
              <label
                style={{
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                워드클라우드
              </label>
            </div>

            {isReceiving && (
              <button
                style={{
                  borderRadius: "4px",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: COLORS.WHITE,
                  backgroundColor: COLORS.PRIMARY,
                  padding: "4px 6px",
                }}
                onClick={onClickStopButton}
              >
                {t("responseMessageBox_stopButtonText")}
              </button>
            )}
          </div>
        </div>
      }
    />
  );
}

type ChatBoxProps = {
  chat: Chat;
  isWordCloud?: boolean;
} & BoxProps;
export const CheckyChatBox = ({
  chat,
  isWordCloud,
  ...restProps
}: ChatBoxProps) => {
  function wrapSpecificTextInSpan(
    inputString: string,
    targetText: string
  ): string {
    // 정규식을 사용하여 대상 문자열을 검색하고 각 매치를 <span> 태그로 감싼다.
    const regex = new RegExp(targetText, "g");
    const wrappedString = inputString.replace(
      regex,
      `<span style="font-weight: bold; color: #3f75e5">${targetText}</span>`
    );

    return wrappedString;
  }

  if (chat.role === "error") {
    return (
      <AssistantChat {...restProps}>
        <ChatText isError>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  if (chat.role === "assistant") {
    if (chat.isUrl === "url") {
      const myJson = JSON.parse(chat.content);
      if (!myJson || myJson.code !== 0) {
        return (
          <div>옳지 않은 응답을 받았거나 URL이 옳바르지 않은 형식입니다.</div>
        );
      }

      const {
        data: { summaryContent, tags, words, ads },
      } = myJson;

      if (!summaryContent) {
        return <div>요약된 결과가 없습니다.</div>;
      }

      const tagList: TagObject[] = [];

      let replaceString = summaryContent as string;
      replaceString = replaceString.replace(/"/g, "");
      replaceString = replaceString.replace(/\\n/g, "<br/><br/>");

      tags.forEach((item: string, index: number) => {
        replaceString = wrapSpecificTextInSpan(replaceString, item);
        const newTag = {
          name: item.trim(),
          // color: COLORS[Math.floor(Math.random() * COLORS.length)],
          color: COLORS.PRIMARY,
          id: index,
        };
        tagList.push(newTag);
      });

      if (ads) {
        tagList.unshift({
          name: "광고",
          color: COLORS.RED,
          id: 9999,
        });
      }

      return (
        <AssistantChat {...restProps}>
          <AdsWarning ads={ads} />
          <TagContainer tags={tagList} />
          <ChatText>{parse(replaceString)}</ChatText>
          {isWordCloud && <WordCloud words={words} />}
        </AssistantChat>
      );
    } else {
      return (
        <AssistantChat {...restProps}>
          <ChatText>{chat.content}</ChatText>
        </AssistantChat>
      );
    }
  }

  return (
    <UserChat {...restProps}>
      <ChatText textAlign="end" bold>
        {chat.content.trim()}
      </ChatText>
    </UserChat>
  );
};

export const ChatBox = ({ chat, ...restProps }: ChatBoxProps) => {
  if (chat.role === "error") {
    return (
      <AssistantChat {...restProps}>
        <ChatText isError>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  if (chat.role === "assistant") {
    return (
      <AssistantChat {...restProps}>
        <ChatText>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  return (
    <UserChat {...restProps}>
      <ChatText bold textAlign="end">
        {chat.content.trim()}
      </ChatText>
    </UserChat>
  );
};

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}

const AdsWarning = ({ ads }: { ads: boolean }) => {
  if (!ads) {
    return null;
  }
  return <ChatText isError>광고일 확률이 높습니다!</ChatText>;
};
