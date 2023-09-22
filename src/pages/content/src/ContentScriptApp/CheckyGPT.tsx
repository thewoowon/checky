import { useMachine } from "@xstate/react";
import { sendMessageToBackground } from "@src/chrome/message";
import styled from "@emotion/styled";
import checkyStateMachine from "./xState/checkyStateMachine";
import FixedResponseMessageBox from "./components/messageBox/FixedResponseMessageBox";
import FixedErrorMessageBox from "./components/messageBox/FixedErrorMessageBox";
import { useEffect, useState } from "react";

const Container = styled.div`
  * {
    font-family: "Noto Sans KR", sans-serif;
  }
  p {
    color: #000000;
  }
`;

async function getGPTResponseAsStream({
  input,
  onDelta,
  onFinish,
}: {
  input: string;
  onDelta: (chunk: string) => unknown;
  onFinish: (result: string) => unknown;
}) {
  return new Promise<{ firstChunk: string }>((resolve, reject) => {
    sendMessageToBackground({
      message: {
        type: "RequestInitialDragGPTStream",
        input,
      },
      handleSuccess: (response) => {
        if (response.isDone || !response.chunk) {
          return onFinish(response.result);
        }
        resolve({ firstChunk: response.chunk });
        onDelta(response.chunk);
      },
      handleError: reject,
    });
  });
}

export default function CheckyGPT() {
  const [dragLink, setDragLink] = useState<string | null>(null);
  const [state, send] = useMachine(checkyStateMachine, {
    services: {
      getGPTResponse: (context) => {
        return new Promise((resolve, reject) => {
          getGPTResponseAsStream({
            input: context.enteredText,
            onDelta: (chunk) => {
              send("RECEIVE_ING", { data: chunk });
              resolve({
                firstChunk: chunk,
              });
            },
            onFinish: (result) => {
              send("RECEIVE_END");
              resolve({
                firstChunk: result,
              });
            },
          });
        });
      },
    },
  });

  const closeMessageBox = () => {
    send("CLOSE_MESSAGE_BOX");
  };

  useEffect(() => {
    const toAbsoluteUrl = (function () {
      let anchor: HTMLAnchorElement | null = null;

      return function (url: string) {
        if (!anchor) {
          anchor = document.createElement("a");
        }

        anchor.href = url;

        return new URL(anchor.href);
      };
    })();

    function onDragStart(e: DragEvent) {
      if (!(e.target instanceof HTMLAnchorElement)) {
        return;
      }

      const url = toAbsoluteUrl(e.target.href);

      setDragLink(url.href);
    }

    window.document.addEventListener("dragstart", onDragStart, {
      capture: true,
      passive: true,
    });

    return () => {
      window.document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return (
    <Container>
      {state.hasTag("showRequestMessages") && (
        <FixedResponseMessageBox
          onClose={closeMessageBox}
          initialChats={state.context.chats}
          dragLink={dragLink}
        />
      )}
      {state.matches("error_message_box") && (
        <FixedErrorMessageBox
          onClose={closeMessageBox}
          error={state.context.error}
        />
      )}
    </Container>
  );
}
