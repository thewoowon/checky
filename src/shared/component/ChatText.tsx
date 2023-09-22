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
  padding = 6,
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
        padding: `${padding}px`,
        textAlign,
        color: isError ? "red" : "black",
        lineHeight: 1.3,
        fontSize: "14px",
        fontWeight: bold ? "bold" : "normal",
        ...restProps,
      }}
    >
      {typeof children === "string" ? children.trim() : children}
    </div>
  );
}
