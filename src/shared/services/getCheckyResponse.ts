import { sendMessageToBackground } from "@src/chrome/message";

export async function getCheckyGPTResponse({
  messages,
  isGpt4,
  onDelta,
  onFinish,
}: {
  messages: Chat[];
  isGpt4: boolean;
  onDelta: (chunk: string) => unknown;
  onFinish: (result: string) => unknown;
}) {
  return new Promise<{ cancel: () => unknown; firstChunk: string }>(
    (resolve, reject) => {
      const { disconnect } = sendMessageToBackground({
        message: {
          type: "RequestCheckyChatGPT",
          input: { messages, isGpt4 },
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
