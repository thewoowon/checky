import type { ChatCompletionRequestMessage } from "openai";

type Error = {
  error: {
    type: string;
    code: string | "context_length_exceeded";
    message?: string;
  };
};
export async function checkyGPTStream({
  input,
  slot,
  chats,
  apiKey,
  onDelta,
}: {
  slot: ChatGPTSlot;
  chats?: Chat[];
  input?: string;
  apiKey: string;
  onDelta?: (chunk: string) => unknown;
}): Promise<{ summaryResult: string }> {
  const messages: ChatCompletionRequestMessage[] = [];

  // 일단 링크를 입력 받았다고 가정
  if (hasChats(chats)) {
    messages.push(...convertChatsToMessages(chats));
  }
  // 인풋이 있으면 인풋을 넣어준다.
  if (input) {
    messages.push({ role: "user", content: input });
  }
  const summaryResponse = await requestSummaryStreamApi({
    url: messages.at(-1)?.content ?? "",
    type: slot.type === "ChatGPT4" ? 1 : 0,
    language: slot.language ?? "ko",
  });

  await handleSummaryError(summaryResponse);

  const summaryResult = await parseSummaryStreamResult(
    summaryResponse,
    onDelta
  );

  return { summaryResult: summaryResult };
}

async function handleSummaryError(response: Response) {
  if (response.status !== 200) {
    const responseError: Error = await response.json();

    const error = new Error();
    error.name = responseError.error.type;
    error.message =
      responseError.error.code + responseError.error.message ?? "";
    throw error;
  }
}

async function parseSummaryStreamResult(
  response: Response,
  onDelta?: (chunk: string) => unknown
) {
  const reader = response.body
    ?.pipeThrough(new TextDecoderStream())
    .getReader();

  let result = "";
  while (reader) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    if (value.includes("data: [DONE]")) {
      break;
    }

    const lines = value.split("\n\n").filter(Boolean);
    const chunks = lines
      .map((line) => line.substring(5).trim())
      .map((line) => line.replace(/\\n/g, "<br/>"))
      // non-whitespace character를 지우고, 빈 문자열이 아닌 것만 남긴다.
      .filter(Boolean);

    chunks.forEach((chunk) => {
      result += chunk;
      onDelta?.(chunk);
    });
  }
  return result;
}

async function parseSummaryResult(
  response: Response,
  onDelta?: (chunk: string) => unknown
) {
  const reader = response.body
    ?.pipeThrough(new TextDecoderStream())
    .getReader();

  let result = "";

  while (reader) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    result += value;
    onDelta?.(value);
  }
  return result;
}

async function requestSummaryStreamApi(body: {
  url: string;
  type: number;
  language: "ko" | "en";
}) {
  const endpoint = new URL("http://13.124.34.149:8080");

  // http://13.209.74.106:8080/crawling/result/

  endpoint.pathname = "/crawling/result/stream";

  endpoint.searchParams.append("url", body.url);
  endpoint.searchParams.append("type", body.type.toString());

  // response에서 data 뽑아내기
  return fetch(endpoint.href, {
    headers: {
      "Content-Type": "application/json",
      withCredentials: "true",
      Accept: "text/event-stream",
    },
    credentials: "include",
    method: "GET",
  }).then((response) => response);
}

function hasChats(chats?: Chat[]): chats is Chat[] {
  return chats !== undefined && chats.length > 0;
}

function convertChatsToMessages(chats: Chat[]): ChatCompletionRequestMessage[] {
  return chats
    .filter((chat) => chat.role !== "error")
    .map((chat) => {
      return {
        role: chat.role === "user" ? "user" : "assistant",
        content: chat.content,
      };
    });
}
