import { BoxProps, Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type AssistantChatProps = PropsWithChildren & Omit<BoxProps, "alignSelf">;

export default function AssistantChat({ ...restProps }: AssistantChatProps) {
  return (
    <div
      style={{
        width: "100%",
        textAlign: "start",
      }}
    >
      {restProps.children}
    </div>
  );
}
