import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import popupStateMachine from "@src/pages/popup/xState/popupStateMachine";
import { useMachine } from "@xstate/react";
import NoApiKeyPage from "../NoApiPage";
import makeFetchCookie from "fetch-cookie";

const saveApiKeyToBackground = async (apiKey: string) => {
  await sendMessageToBackgroundAsync({
    type: "SaveAPIKey",
    input: apiKey,
  });
};

const saveAccessTokenToBackground = async (accessToken: string) => {
  await sendMessageToBackgroundAsync({
    type: "SaveAccessToken",
    input: accessToken,
  });
};

const saveLanguageToBackground = async (language: string) => {
  await sendMessageToBackgroundAsync({
    type: "SaveLanguage",
    input: language,
  });
};

const getApiKeyFromBackground = async () => {
  return sendMessageToBackgroundAsync({
    type: "GetAPIKey",
  });
};

const getLanguageFromBackground = async () => {
  return sendMessageToBackgroundAsync({
    type: "GetLanguage",
  });
};

const getAccessTokenFromBackground = async () => {
  return sendMessageToBackgroundAsync({
    type: "GetAccessToken",
  });
};

const resetApiKeyFromBackground = () => {
  sendMessageToBackground({
    message: {
      type: "ResetAPIKey",
    },
  });
};

const resetAccessTokenFromBackground = () => {
  sendMessageToBackground({
    message: {
      type: "ResetAccessToken",
    },
  });
};

const resetLanguageFromBackground = () => {
  sendMessageToBackground({
    message: {
      type: "ResetLanguage",
    },
  });
};

const LoginZone = () => {
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
    </>
  );
};

export default LoginZone;
