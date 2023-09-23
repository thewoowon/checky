import { ComponentPropsWithRef, ReactNode, useRef } from "react";
import { COLORS, Z_INDEX } from "@src/constant/style";

export type FixedMessageBoxProps = {
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  width?: number;
  onClose: () => void;
} & ComponentPropsWithRef<"div">;

export default function FixedMessageBox({
  header,
  width,
  content,
  onClose,
  footer,
  ...restProps
}: FixedMessageBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        background: COLORS.WHITE,
        display: "flex",
        flexDirection: "column",
        zIndex: Z_INDEX.ROOT,
        whiteSpace: "pre-wrap",
        width: width ? width + "px" : "100%",
        maxWidth: "500px",
        borderRadius: "6px",
        fontSize: "14px",
        lineHeight: "16px",
        boxShadow: "0 0 0 1px #e2e8f0, 0 2px 4px 0 rgba(0, 0, 0, 0.1)",
      }}
      ref={containerRef}
      {...restProps}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "10px",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            width: "100%",
            padding: "6px 0",
          }}
        >
          {header}
        </div>
        <div
          style={{
            width: "100%",
          }}
        >
          {content}
        </div>
        {footer}
      </div>
    </div>
  );
}
