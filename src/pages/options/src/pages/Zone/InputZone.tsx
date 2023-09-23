import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import popupStateMachine from "@src/pages/popup/xState/popupStateMachine";
import { useMachine } from "@xstate/react";
import NoApiKeyPage from "../NoApiPage";
import SlotListPage from "@src/pages/popup/pages/SlotListPage";
import QuickChattingPage from "@src/pages/popup/pages/QuickChattingPage";
import CheckyPage from "@src/pages/popup/pages/CheckyPage";

const saveApiKeyToBackground = async (apiKey: string) => {
  await sendMessageToBackgroundAsync({
    type: "SaveAPIKey",
    input: apiKey,
  });
};

const getApiKeyFromBackground = async () => {
  return sendMessageToBackgroundAsync({
    type: "GetAPIKey",
  });
};

const resetApiKeyFromBackground = () => {
  sendMessageToBackground({
    message: {
      type: "ResetAPIKey",
    },
  });
};

const InputZone = () => {
  const [state, send] = useMachine(popupStateMachine, {
    services: {
      saveApiKeyToBackground: (context) => {
        return saveApiKeyToBackground(context.openAiApiKey ?? "");
      },
      getApiKeyFromBackground,
    },
    actions: {
      resetApiKeyFromBackground,
    },
  });

  const checkApiKey = (apiKey: string) => {
    send({ type: "CHECK_API_KEY", data: apiKey });
  };

  return (
    <>
      {state.hasTag("noApiKeyPage") && (
        <NoApiKeyPage
          apiKeyError={state.context.apiKeyCheckError}
          loading={state.matches("checking_api_key")}
          checkApiKey={checkApiKey}
        />
      )}
      <div
        style={{
          minWidth: "400px",
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {state.matches("slot_list_page") && (
          <SlotListPage
            onClickChangeApiKey={() => send("RESET_API_KEY")}
            onClickQuickChatButton={() => send("GO_TO_QUICK_CHAT")}
          />
        )}
      </div>
      {state.matches("quick_chat") && (
        <QuickChattingPage onClickBackButton={() => send("EXIT_QUICK_CHAT")} />
      )}
      {state.matches("checky_chat") && (
        <CheckyPage onClickBackButton={() => send("EXIT_QUICK_CHAT")} />
      )}
    </>
  );
};

export default InputZone;
