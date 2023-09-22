import { assign, createMachine } from "xstate";

type Events =
  | {
      type: "REQUEST";
      data: {
        enteredText: string;
      };
    }
  | {
      type: "CLOSE_MESSAGE_BOX" | "RECEIVE_END" | "RECEIVE_CANCEL";
      data: string;
    }
  | { type: "RECEIVE_ING"; data: string };

interface Context {
  chats: Chat[];
  enteredText: string;
  error?: Error;
}

type Services = {
  getGPTResponse: {
    data: { firstChunk: string };
  };
};

const initialContext: Context = {
  chats: [] as Chat[],
  enteredText: "",
  error: undefined,
} as const;

const checkyStateMachine = createMachine(
  {
    id: "drag-state",
    initial: "idle",
    predictableActionArguments: true,
    context: initialContext,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    tsTypes: {} as import("./checkyStateMachine.typegen").Typegen0,
    states: {
      idle: {
        tags: "showRequestMessages",
        entry: ["resetAll"],
        on: {
          REQUEST: {
            target: "loading",
            actions: ["readyRequestButton", "addRequestChat"],
          },
        },
      },
      // 요청을 보내는 중
      loading: {
        tags: "showRequestMessages",
        invoke: {
          src: "getGPTResponse",
          onDone: {
            target: "response",
            actions: "addInitialResponseChat",
          },
          onError: {
            target: "error_message_box",
            actions: assign({
              error: (_, event) => event.data,
            }),
          },
        },
      },
      response: {
        tags: "showRequestMessages",
        on: {
          RECEIVE_ING: {
            actions: "addResponseChatChunk",
          },
          RECEIVE_END: "idle",
          RECEIVE_CANCEL: "idle",
          CLOSE_MESSAGE_BOX: "idle",
        },
      },
      error_message_box: {
        on: {
          CLOSE_MESSAGE_BOX: "idle",
        },
      },
    },
  },
  {
    actions: {
      resetAll: assign({ ...initialContext }),
      readyRequestButton: assign({
        enteredText: (_, event) => event.data.enteredText,
      }),
      addRequestChat: assign({
        chats: (context) =>
          context.chats.concat({
            role: "user",
            content: context.enteredText,
            isUrl: "text",
          }),
      }),
      addInitialResponseChat: assign({
        chats: (context, event) =>
          context.chats.concat({
            role: "assistant",
            content: event.data.firstChunk,
            isUrl: "text",
          }),
      }),
      addResponseChatChunk: assign({
        chats: ({ chats }, event) => {
          const lastChat = chats.at(-1);
          if (!lastChat) {
            return chats;
          }
          return chats
            .slice(0, chats.length - 1)
            .concat({ ...lastChat, content: lastChat.content + event.data });
        },
      }),
    },
  }
);

export default checkyStateMachine;
