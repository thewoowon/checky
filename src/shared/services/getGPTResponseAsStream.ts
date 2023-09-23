import { sendMessageToBackground } from "@src/chrome/message";

export async function getQuickGPTResponseAsStream({
  messages,
  isGpt4,
  language,
  onDelta,
  onFinish,
}: {
  messages: Chat[];
  isGpt4: boolean;
  language: "ko" | "en";
  onDelta: (chunk: string) => unknown;
  onFinish: (result: string) => unknown;
}) {
  return new Promise<{ cancel: () => unknown; firstChunk: string }>(
    (resolve, reject) => {
      const { disconnect } = sendMessageToBackground({
        message: {
          type: "RequestQuickChatGPTStream",
          input: { messages, isGpt4, language: language ?? "ko" },
        },
        handleSuccess: (response) => {
          if (response.isDone || !response.chunk) {
            return onFinish(response.result);
          }
          resolve({ cancel: disconnect, firstChunk: response.chunk });
          onDelta(response.chunk);
        },
        handleError: reject,
      });
    }
  );
}

export async function getDragGPTResponseAsStream({
  input,
  onDelta,
  onFinish,
}: {
  input: { chats: Chat[]; sessionId: string };
  onDelta: (chunk: string) => unknown;
  onFinish: (result: string) => unknown;
}) {
  return new Promise<{ cancel: () => unknown; firstChunk: string }>(
    (resolve, reject) => {
      const { disconnect } = sendMessageToBackground({
        message: {
          type: "RequestDragGPTStream",
          input,
        },
        handleSuccess: (response) => {
          if (response.isDone || !response.chunk) {
            return onFinish(response.result);
          }
          resolve({ cancel: disconnect, firstChunk: response.chunk });
          onDelta(response.chunk);
        },
        handleError: reject,
      });
    }
  );
}
