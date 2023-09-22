// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.drag-state.loading:invocation[0]": {
      type: "done.invoke.drag-state.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getGPTResponse: "done.invoke.drag-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: "getGPTResponse";
  };
  eventsCausingActions: {
    addInitialResponseChat: "done.invoke.drag-state.loading:invocation[0]";
    addRequestChat: "REQUEST";
    addResponseChatChunk: "RECEIVE_ING";
    readyRequestButton: "REQUEST";
    resetAll:
      | "CLOSE_MESSAGE_BOX"
      | "RECEIVE_CANCEL"
      | "RECEIVE_END"
      | "xstate.init";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    getGPTResponse: "REQUEST";
  };
  matchesStates: "error_message_box" | "idle" | "loading" | "response";
  tags: "showRequestMessages";
}
