import { ComponentPropsWithRef, CSSProperties } from "react";
import styled from "@emotion/styled";
import { Spinner, Text, Tooltip } from "@chakra-ui/react";
import { COLORS, Z_INDEX } from "@src/constant/style";

const GAP = 4;

const StyledRequestButton = styled.button`
  border: none;
  padding: 0;
  position: absolute;
  z-index: ${Z_INDEX.ROOT};
  width: 50px;
  height: 50px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ease-in-out 200ms;
  outline: none;
  box-shadow: none;

  &:hover {
    transform: scale(1.1);
    animation: rotate 0.3s infinite linear;
  }

  &:active {
    transform: scale(0.9);
    transition: all ease-in-out 100ms;
  }

  // 20도 , -20도 반복

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(20deg);
    }
    100% {
      transform: rotate(-20deg);
    }
  }
`;

const labelTextInlineStyle: CSSProperties = {
  display: "block",
  fontSize: "13px",
  lineHeight: 1,
  margin: 0,
  maxWidth: "160px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  fontFamily: "Noto Sans KR, sans-serif",
};

type GPTRequestButtonProps = {
  top: number;
  left: number;
  loading: boolean;
  selectedSlot?: Slot;
} & ComponentPropsWithRef<"button">;

export default function CheckyRequestButton({
  top,
  left,
  loading,
  style,
  selectedSlot,
  ...restProps
}: GPTRequestButtonProps) {
  return (
    <Tooltip
      label={
        selectedSlot?.name && (
          <Text style={labelTextInlineStyle}>{selectedSlot.name}</Text>
        )
      }
    >
      <StyledRequestButton
        aria-busy={loading}
        disabled={loading}
        style={{
          ...style,
          top: `${top + GAP}px`,
          left: `${left + GAP}px`,
        }}
        {...restProps}
      >
        {loading ? (
          <Spinner color="white" width="20px" height="20px" />
        ) : (
          <img
            src="https://imagedelivery.net/6qzLODAqs2g1LZbVYqtuQw/415f52ea-b755-42a7-229c-5c7f3a450100/public"
            width={50}
            height={50}
            alt="checky"
          />
        )}
      </StyledRequestButton>
    </Tooltip>
  );
}
