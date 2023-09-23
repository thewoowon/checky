// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.stream-chat-state.init:invocation[0]": {
      type: "done.invoke.stream-chat-state.init:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.stream-chat-state.loading:invocation[0]": {
      type: "done.invoke.stream-chat-state.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.stream-chat-state.loading_url:invocation[0]": {
      type: "done.invoke.stream-chat-state.loading_url:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.stream-chat-state.loading:invocation[0]": {
      type: "error.platform.stream-chat-state.loading:invocation[0]";
      data: unknown;
    };
    "error.platform.stream-chat-state.loading_url:invocation[0]": {
      type: "error.platform.stream-chat-state.loading_url:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getChatHistoryFromBackground: "done.invoke.stream-chat-state.init:invocation[0]";
    getCheckyResponse: "done.invoke.stream-chat-state.loading_url:invocation[0]";
    getGPTResponse: "done.invoke.stream-chat-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: "exitChatting";
    delays: never;
    guards: never;
    services:
      | "getChatHistoryFromBackground"
      | "getCheckyResponse"
      | "getGPTResponse";
  };
  eventsCausingActions: {
    addErrorChat:
      | "error.platform.stream-chat-state.loading:invocation[0]"
      | "error.platform.stream-chat-state.loading_url:invocation[0]";
    addInitialAssistantChat: "done.invoke.stream-chat-state.loading:invocation[0]";
    addInitialCheckyAssistantChat: "done.invoke.stream-chat-state.loading_url:invocation[0]";
    addLinkQueue: "ADD_LINK_QUEUE";
    addResponseToken: "RECEIVE_ING";
    addUserChat: "QUERY" | "QUERY_URL";
    changeLanguage: "CHANGE_LANGUAGE";
    execCancelReceive: "RECEIVE_CANCEL";
    exitChatting: "EXIT";
    popLinkQueue: "RECEIVE_CANCEL" | "RECEIVE_DONE";
    replaceLastResponse: "RECEIVE_DONE";
    resetChatData: "RESET";
    resetChatText: "QUERY" | "QUERY_URL";
    setCancelReceive:
      | "done.invoke.stream-chat-state.loading:invocation[0]"
      | "done.invoke.stream-chat-state.loading_url:invocation[0]";
    setChats: "done.invoke.stream-chat-state.init:invocation[0]";
    toggleIsGpt4: "TOGGLE_IS_GPT4";
    updateChatText: "CHANGE_TEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isValidText: "QUERY" | "QUERY_URL";
  };
  eventsCausingServices: {
    getChatHistoryFromBackground: "xstate.init";
    getCheckyResponse: "QUERY_URL";
    getGPTResponse: "QUERY";
  };
  matchesStates:
    | "finish"
    | "idle"
    | "init"
    | "loading"
    | "loading_url"
    | "receiving";
  tags: never;
}
