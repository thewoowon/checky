import { assign, createMachine } from "xstate";

type Events =
  | { type: "EXIT" | "QUERY" | "RESET" | "RECEIVE_CANCEL" | "TOGGLE_IS_GPT4" }
  | { type: "CHANGE_TEXT"; data: string }
  | { type: "RECEIVE_ING"; data: string }
  | { type: "RECEIVE_DONE"; data: string };

interface Context {
  inputText: string;
  chats: Chat[];
  tempResponse: string;
  isGpt4: boolean;
  error?: Error;
  cancelReceive?: () => unknown;
}

type Services = {
  getGPTResponse: {
    data: { cancel: Context["cancelReceive"]; firstChunk: string };
  };
  getChatHistoryFromBackground: {
    data: Chat[];
  };
};

const initialContext: Context = {
  inputText: "",
  chats: [],
  tempResponse: "",
  isGpt4: false,
};

const streamChatStateMachine = createMachine(
  {
    id: "stream-chat-state",
    initial: "init",
    predictableActionArguments: true,
    context: initialContext,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    tsTypes: {} as import("./streamChatStateMachine.typegen").Typegen0,
    states: {
      init: {
        invoke: {
          src: "getChatHistoryFromBackground",
          onDone: { target: "idle", actions: ["setChats"] },
          onError: { target: "idle" },
        },
      },
      idle: {
        on: {
          QUERY: {
            target: "loading",
            actions: ["addUserChat", "resetChatText"],
            cond: "isValidText",
          },
          EXIT: "finish",
          RESET: { actions: "resetChatData" },
          CHANGE_TEXT: {
            actions: "updateChatText",
          },
          TOGGLE_IS_GPT4: {
            actions: "toggleIsGpt4",
          },
        },
      },
      loading: {
        invoke: {
          src: "getGPTResponse",
          onDone: {
            target: "receiving",
            actions: ["addInitialAssistantChat", "setCancelReceive"],
          },
          onError: { target: "idle", actions: "addErrorChat" },
        },
        on: {
          EXIT: "finish",
          RESET: { actions: "resetChatData" },
          CHANGE_TEXT: {
            actions: "updateChatText",
          },
          TOGGLE_IS_GPT4: {
            actions: "toggleIsGpt4",
          },
        },
      },
      receiving: {
        on: {
          RECEIVE_ING: { target: "receiving", actions: "addResponseToken" },
          RECEIVE_DONE: { target: "idle", actions: "replaceLastResponse" },
          RECEIVE_CANCEL: { target: "idle", actions: "execCancelReceive" },
          CHANGE_TEXT: {
            actions: "updateChatText",
          },
          TOGGLE_IS_GPT4: {
            actions: "toggleIsGpt4",
          },
        },
      },
      finish: {
        type: "final",
        entry: "exitChatting",
      },
    },
  },
  {
    actions: {
      setChats: assign({
        chats: (_, event) => event.data,
      }),
      addUserChat: assign({
        chats: (context) =>
          context.chats.concat({
            role: "user",
            content: context.inputText,
            isUrl: "text",
          }),
      }),
      addInitialAssistantChat: assign({
        chats: (context, event) =>
          context.chats.concat({
            role: "assistant",
            content: event.data.firstChunk,
            isUrl: "text",
          }),
      }),
      addResponseToken: assign({
        chats: (context, event) => {
          return context.chats.map((chat, index) => {
            // if last index
            if (index === context.chats.length - 1) {
              return { ...chat, content: chat.content + event.data };
            }
            return chat;
          });
        },
      }),
      replaceLastResponse: assign({
        chats: (context, event) => {
          return context.chats.map((chat, index) => {
            if (index === context.chats.length - 1) {
              return { ...chat, content: event.data };
            }
            return chat;
          });
        },
      }),
      setCancelReceive: assign({
        cancelReceive: (_, event) => event.data.cancel,
      }),
      execCancelReceive: (context) => {
        context.cancelReceive?.();
      },
      addErrorChat: assign({
        chats: (context, event) => {
          const error: Error = event.data as Error;
          return context.chats.concat({
            role: "error",
            content: `${error?.name}\n${error?.message}`,
            isUrl: "text",
          });
        },
      }),
      updateChatText: assign({
        inputText: (_, event) => event.data,
      }),
      resetChatText: assign({
        inputText: () => "",
      }),
      resetChatData: assign({ chats: () => [] }),
      toggleIsGpt4: assign({ isGpt4: (context) => !context.isGpt4 }),
    },
    guards: {
      isValidText: (context) => context.inputText.length > 0,
    },
  }
);

export default streamChatStateMachine;
