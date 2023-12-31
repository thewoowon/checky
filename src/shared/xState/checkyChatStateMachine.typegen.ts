// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.checky-chat-state.init:invocation[0]": {
      type: "done.invoke.checky-chat-state.init:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.checky-chat-state.loading:invocation[0]": {
      type: "done.invoke.checky-chat-state.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.checky-chat-state.loading:invocation[0]": {
      type: "error.platform.checky-chat-state.loading:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getChatHistoryFromBackground: "done.invoke.checky-chat-state.init:invocation[0]";
    getGPTResponse: "done.invoke.checky-chat-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: "exitChatting";
    delays: never;
    guards: never;
    services: "getChatHistoryFromBackground" | "getGPTResponse";
  };
  eventsCausingActions: {
    addAssistantChat: "done.invoke.checky-chat-state.loading:invocation[0]";
    addErrorChat: "error.platform.checky-chat-state.loading:invocation[0]";
    addUserChat: "QUERY";
    exitChatting: "EXIT";
    resetChatData: "RESET";
    resetChatText: "QUERY";
    setChats: "done.invoke.checky-chat-state.init:invocation[0]";
    updateChatText: "CHANGE_TEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isValidText: "QUERY";
  };
  eventsCausingServices: {
    getChatHistoryFromBackground: "xstate.init";
    getGPTResponse: "QUERY";
  };
  matchesStates: "finish" | "idle" | "init" | "loading";
  tags: never;
}
