import { PropsWithChildren } from "react";

type ChatTextProps = PropsWithChildren<{
  isError?: boolean;
  bold?: boolean;
  padding?: number;
  border?: boolean;
  textAlign?: "start" | "end";
}>;

export default function ChatText({
  isError,
  bold,
  border = true,
  children,
  textAlign = "start",
  ...restProps
}: ChatTextProps) {
  return (
    <div
      style={{
        borderRadius: "4px",
        whiteSpace: "pre-wrap",
        border: border ? "1px solid #f0ffff2e" : undefined,
        textAlign,
        color: isError ? "red" : "black",
        lineHeight: 1.3,
        fontSize: "8px",
        fontWeight: bold ? "bold" : "normal",
        ...restProps,
      }}
    >
      {typeof children === "string" ? children.trim() : children}
    </div>
  );
}
