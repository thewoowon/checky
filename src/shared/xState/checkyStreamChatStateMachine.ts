import { assign, createMachine } from "xstate";

export type LinkQueueType = {
  url: string;
  title: string;
};

type Events =
  | { type: "QUERY_URL"; data: boolean }
  | { type: "QUERY"; data: boolean }
  | {
      type:
        | "EXIT"
        | "RESET"
        | "RECEIVE_CANCEL"
        | "TOGGLE_IS_GPT4"
        | "TOGGLE_WORD_CLOUD";
    }
  | { type: "CHANGE_TEXT"; data: string }
  | { type: "RECEIVE_ING"; data: string }
  | { type: "RECEIVE_DONE"; data: string }
  | {
      type: "ADD_LINK_QUEUE";
      data: LinkQueueType;
    }
  | {
      type: "CHANGE_LANGUAGE";
      data: "ko" | "en";
    };

interface Context {
  inputText: string;
  chats: Chat[];
  tempResponse: string;
  isGpt4: boolean;
  error?: Error;
  cancelReceive?: () => unknown;
  linkQueue?: LinkQueueType[];
  language?: "ko" | "en";
}

type Services = {
  getGPTResponse: {
    data: { cancel: Context["cancelReceive"]; firstChunk: string };
  };
  getCheckyResponse: {
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
  linkQueue: [],
  language: "ko",
};

const checkyStreamChatStateMachine = createMachine(
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
    tsTypes: {} as import("./checkyStreamChatStateMachine.typegen").Typegen0,
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
          QUERY_URL: {
            target: "loading_url",
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
          ADD_LINK_QUEUE: {
            actions: ["addLinkQueue"],
          },
          CHANGE_LANGUAGE: {
            actions: "changeLanguage",
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
          ADD_LINK_QUEUE: {
            actions: ["addLinkQueue"],
          },
          CHANGE_LANGUAGE: {
            actions: "changeLanguage",
          },
        },
      },
      loading_url: {
        invoke: {
          src: "getCheckyResponse",
          onDone: {
            target: "receiving",
            actions: ["addInitialCheckyAssistantChat", "setCancelReceive"],
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
          ADD_LINK_QUEUE: {
            actions: ["addLinkQueue"],
          },
          CHANGE_LANGUAGE: {
            actions: "changeLanguage",
          },
        },
      },
      receiving: {
        on: {
          RECEIVE_ING: { target: "receiving", actions: "addResponseToken" },
          RECEIVE_DONE: {
            target: "idle",
            actions: ["replaceLastResponse", "popLinkQueue"],
          },
          RECEIVE_CANCEL: {
            target: "idle",
            actions: ["execCancelReceive", "popLinkQueue"],
          },
          CHANGE_TEXT: {
            actions: "updateChatText",
          },
          TOGGLE_IS_GPT4: {
            actions: "toggleIsGpt4",
          },
          ADD_LINK_QUEUE: {
            actions: ["addLinkQueue"],
          },
          CHANGE_LANGUAGE: {
            actions: "changeLanguage",
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
      addLinkQueue: assign({
        linkQueue: (context, event) => {
          const linkQueue = context.linkQueue || [];
          return linkQueue.concat(event.data);
        },
      }),
      changeLanguage: assign({
        language: (_, event) => event.data,
      }),
      popLinkQueue: assign({
        linkQueue: (context) => {
          const linkQueue = context.linkQueue || [];
          return linkQueue.slice(1);
        },
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
      addInitialCheckyAssistantChat: assign({
        chats: (context, event) =>
          context.chats.concat({
            role: "assistant",
            content: event.data.firstChunk,
            isUrl: "url",
          }),
      }),
      addResponseToken: assign({
        chats: (context, event) => {
          return context.chats.map((chat, index) => {
            // if last index
            if (index === context.chats.length - 1) {
              return { ...chat, content: event.data };
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

export default checkyStreamChatStateMachine;
