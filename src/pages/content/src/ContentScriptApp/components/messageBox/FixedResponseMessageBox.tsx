import { FormEventHandler, useEffect, useState } from "react";
import { BoxProps, Progress, Select, Spinner } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import ChatText from "@src/shared/component/ChatText";
import AssistantChat from "@src/shared/component/AssistantChat";
import UserChat from "@src/shared/component/UserChat";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import { t } from "@src/chrome/i18n";
import { getDragGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";
import { getCheckyGPTResponse } from "@src/shared/services/getCheckyResponse";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import useGeneratedId from "@src/shared/hook/useGeneratedId";
import { COLORS } from "@src/constant/style";
import FixedMessageBox, { FixedMessageBoxProps } from "./FixedMessageBox";
import TagContainer from "../Tags";
import parse from "html-react-parser";
import { TagObject } from "../Tags/TagContainer";
import checkyStreamChatStateMachine from "@src/shared/xState/checkyStreamChatStateMachine";
import WordCloud from "../WordCloud";
import Queue, { QueueWorkerCallback } from "queue";
import TaskQueue from "../TaskQueue";
import { Switch } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import styled from "@emotion/styled";
import { title } from "process";

type FixedResponseMessageBoxProps = Omit<
  FixedMessageBoxProps,
  "header" | "width" | "footer" | "content"
> & {
  initialChats: Chat[];
};

export default function FixedResponseMessageBox({
  initialChats,
  onClose,
}: FixedResponseMessageBoxProps) {
  const { id: sessionId } = useGeneratedId("checky_");
  const [toggleTaskQueue, setToggleTaskQueue] = useState(false);
  const [client, setClient] = useState<{
    clientX: number;
    clientY: number;
  }>({ clientX: 0, clientY: 0 });
  const [state, send] = useMachine(checkyStreamChatStateMachine, {
    services: {
      getChatHistoryFromBackground: async () => {
        void sendMessageToBackgroundAsync({
          type: "SaveChatHistory",
          input: { sessionId, chats: initialChats, type: "Drag" },
        });
        return initialChats;
      },
      getGPTResponse: (context) => {
        void sendMessageToBackgroundAsync({
          type: "PushChatHistory",
          input: { sessionId, chats: context.chats.at(-1) as Chat },
        });
        return new Promise((resolve, reject) => {
          getDragGPTResponseAsStream({
            input: { chats: context.chats, sessionId },
            onDelta: (chunk) => {
              send("RECEIVE_ING", { data: chunk });
              resolve({
                firstChunk: chunk,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
            onFinish: (result) => {
              send("RECEIVE_DONE", { data: result });
              void sendMessageToBackgroundAsync({
                type: "PushChatHistory",
                input: {
                  sessionId,
                  chats: { role: "assistant", content: result, isUrl: "text" },
                },
              });
              resolve({
                firstChunk: result,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
          });
        });
      },
      getCheckyResponse: (context) => {
        void sendMessageToBackgroundAsync({
          type: "PushChatHistory",
          input: { sessionId, chats: context.chats.at(-1) as Chat },
        });
        return new Promise((resolve, reject) => {
          getCheckyGPTResponse({
            language: context.language ?? "ko",
            isGpt4: context.isGpt4,
            messages: context.chats,
            onDelta: (chunk) => {
              send("RECEIVE_ING", { data: chunk });
              resolve({
                firstChunk: chunk,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
            onFinish: (result) => {
              send("RECEIVE_DONE", { data: result });
              void sendMessageToBackgroundAsync({
                type: "PushChatHistory",
                input: {
                  sessionId,
                  chats: {
                    role: "assistant",
                    content: result,
                    isUrl: "url",
                  },
                },
              });
              resolve({
                firstChunk: result,
                cancel: () => {
                  send("RECEIVE_CANCEL");
                  reject();
                },
              });
            },
          });
        });
      },
    },
    actions: {
      exitChatting: onClose,
    },
  });

  /** 첫 번째 질문 숨김처리 (드래깅으로 질문) */
  const [, ...chats] = state.context.chats;
  const isLoading = state.matches("loading");
  const isLoadingUrl = state.matches("loading_url");
  const isReceiving = state.matches("receiving");

  const { scrollDownRef } = useScrollDownEffect([chats.at(-1)?.content]);
  const { isCopied, copy } = useCopyClipboard([
    chats.filter(({ role }) => role === "assistant").length,
  ]);

  const onClickStopButton = () => {
    send("RECEIVE_CANCEL");
  };

  const onClickCopy = async () => {
    const lastResponseText = findLastResponseChat(chats);
    if (lastResponseText) {
      await copy(lastResponseText.content);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.setItem("language", e.target.value);
    if (e.target.value === "ko") {
      send({ type: "CHANGE_LANGUAGE", data: "ko" });
    } else {
      send({ type: "CHANGE_LANGUAGE", data: "en" });
    }
  };

  const handleTaskQueuePop = (e: React.MouseEvent<HTMLButtonElement>) => {
    setToggleTaskQueue(!toggleTaskQueue);
  };
  // TODO refactor
  const lastResponseIndex: number = (() => {
    if (isLoading) {
      return chats.length - 2;
    }
    return chats.length - 1;
  })();

  const isUrl = (url: string) => {
    const regExp = new RegExp(
      "^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$"
    );
    return regExp.test(url);
  };

  const onChatSubmit: FormEventHandler = (event) => {
    event.preventDefault();

    if (isUrl(state.context.inputText)) {
      send({ type: "QUERY_URL", data: true });
    } else {
      send({ type: "QUERY", data: false });
    }
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

      const dragImage = document.createElement("img");
      dragImage.src =
        "https://imagedelivery.net/6qzLODAqs2g1LZbVYqtuQw/b0d2d496-c2a2-413a-bd28-4dd417513600/public";
      dragImage.width = 50;
      dragImage.height = 50;
      dragImage.alt = "checky";
      dragImage.className = "drag-image";
      e.dataTransfer?.setDragImage(dragImage, 0, 0);

      const url = toAbsoluteUrl(e.target.href);

      const dragLink = url.href;
      const dragText = e.target.innerText;

      if (dragLink && dragText) {
        state.context.linkQueue?.forEach((link) => {
          if (link.url === dragLink) {
            alert("알림: 이미 추가된 링크입니다.");
          }
        });
        send({
          type: "ADD_LINK_QUEUE",
          data: {
            url: dragLink,
            title: dragText,
          },
        });
        send({ type: "CHANGE_TEXT", data: dragLink });
        send({ type: "QUERY_URL", data: true });
      }
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
    <FixedMessageBox
      header={
        <header
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "12px",
            color: "black",
            fontWeight: "700",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <img
              src="https://imagedelivery.net/6qzLODAqs2g1LZbVYqtuQw/82d08ec2-bab4-44cb-0b99-fed3be123f00/public"
              width={20}
              height={20}
              alt="logo"
            />
            Checky
            {isLoading || isLoadingUrl || isReceiving ? (
              <Spinner color="black" width="10px" height="10px" />
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div>
              <select
                style={{
                  backgroundColor: "transparent",
                }}
                onChange={handleLanguageChange}
                value={state.context.language}
              >
                <option value="ko">ko</option>
                <option value="en">en</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
              }}
            >
              GPT 4
              <Switch
                size="md"
                colorScheme="teal"
                checked={state.context.isGpt4}
                onChange={(e) => {
                  send({ type: "TOGGLE_IS_GPT4" });
                }}
              />
            </div>
          </div>
        </header>
      }
      onClose={() => send("EXIT")}
      content={
        <div
          ref={scrollDownRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            paddingTop: "8px",
            color: "#000000",
            maxHeight: "400px",
            width: "100%",
            overflowY: "scroll",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              height: "300px",
              justifyContent: "center",
            }}
          >
            <div>{`"언제하는거야?"`}</div>
            <img
              src="https://imagedelivery.net/6qzLODAqs2g1LZbVYqtuQw/c91baa35-b53d-4d81-ded8-a39a6f038600/public"
              width={81}
              height={100}
              alt="checky"
            />
            <div
              style={{
                color: "#818181",
                fontSize: "12px",
              }}
            >
              체키가 필요한 링크를 드래그 하세요.
            </div>
          </div>
          {chats.map((chat, index) => (
            <CheckyChatBox key={index} chat={chat} />
          ))}
        </div>
      }
      footer={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            paddingTop: "8px",
            color: "#000000",
            position: "relative",
          }}
        >
          {/* <form
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "4px",
            }}
            onSubmit={onChatSubmit}
          >
            <input
              style={{
                width: "100%",
                color: "black",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                padding: "2px",
              }}
              value={state.context.inputText || ""}
              placeholder={t("responseMessageBox_messageInputPlacepolder")}
              onChange={(e) =>
                send({ type: "CHANGE_TEXT", data: e.target.value })
              }
              onKeyDown={(e) => e.stopPropagation()}
            />

            <button
              style={{
                minWidth: "48px",
                padding: "4px",
                borderRadius: "4px",
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "10px",
                color: COLORS.WHITE,
                backgroundColor: COLORS.PRIMARY,
              }}
            >
              {isLoading || isLoadingUrl || isReceiving
                ? "loading"
                : t("responseMessageBox_sendButtonText")}
            </button>
          </form> */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
              gap: "4px",
              padding: "6px 0px",
            }}
          >
            {/* <button
              style={{
                borderRadius: "4px",
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                color: COLORS.WHITE,
                backgroundColor: COLORS.PRIMARY,
                padding: "4px 6px",
              }}
              onClick={onClickCopy}
            >
              {isCopied
                ? t("responseMessageBox_copyButtonText_copied")
                : t("responseMessageBox_copyButtonText_copy")}
            </button>
            <button
              style={{
                borderRadius: "4px",
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                color: COLORS.WHITE,
                backgroundColor: COLORS.PRIMARY,
                padding: "4px 6px",
              }}
              onClick={handleTaskQueuePop}
            >
              태스크 큐
            </button> */}
            {isReceiving && (
              <button
                style={{
                  borderRadius: "4px",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: COLORS.WHITE,
                  backgroundColor: COLORS.PRIMARY,
                  padding: "4px 6px",
                }}
                onClick={onClickStopButton}
              >
                {t("responseMessageBox_stopButtonText")}
              </button>
            )}
          </div>

          {/* <TaskQueue
            queue={state.context.linkQueue || []}
            setSelectedTask={() => {
              console.log("setSelectedTask");
            }}
            clientX={client.clientX}
            clientY={client.clientY}
          /> */}
        </div>
      }
    />
  );
}

type ChatBoxProps = {
  chat: Chat;
} & BoxProps;
export const CheckyChatBox = ({ chat, ...restProps }: ChatBoxProps) => {
  function wrapSpecificTextInSpan(
    inputString: string,
    targetText: string
  ): string {
    // 정규식을 사용하여 대상 문자열을 검색하고 각 매치를 <span> 태그로 감싼다.
    const regex = new RegExp(targetText, "g");
    const wrappedString = inputString.replace(
      regex,
      `<span style="font-weight: bold; text-decoration-line:underline">${targetText}</span>`
    );

    return wrappedString;
  }

  if (chat.role === "error") {
    return (
      <AssistantChat {...restProps}>
        <ChatText isError>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  if (chat.role === "assistant") {
    if (chat.isUrl === "url") {
      const myJson = JSON.parse(chat.content);
      if (!myJson || myJson.code !== 0) {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              gap: "4px",
              padding: "6px 0px",
              height: "300px",
            }}
          >
            <img
              src="https://imagedelivery.net/6qzLODAqs2g1LZbVYqtuQw/67938d5f-9aba-498d-00a3-f4ba75465c00/public"
              width={80}
              height={128}
              alt="error"
            />
            <div>값을 불러올 수 없어요!</div>
          </div>
        );
      }

      const {
        data: { summaryContent, tags, adsPercent, keywords, title },
      }: {
        data: {
          title: string;
          summaryContent: string;
          tags: string[];
          adsPercent: number;
          keywords: {
            keyword: string;
            wikiContent: string;
            wikiUrl: string;
          }[];
        };
      } = myJson;

      if (!summaryContent) {
        return <div>요약된 결과가 없습니다.</div>;
      }

      const tagList: TagObject[] = [];

      let replaceString = summaryContent as string;
      replaceString = replaceString.replace(/"/g, "");
      replaceString = replaceString.replace(/\\n/g, "<br/><br/>");

      tags.forEach((item: string, index: number) => {
        replaceString = wrapSpecificTextInSpan(replaceString, item);
        const newTag = {
          name: item.trim(),
          // color: COLORS[Math.floor(Math.random() * COLORS.length)],
          color: "#A02501",
          id: index,
        };
        tagList.push(newTag);
      });

      return (
        <AssistantChat {...restProps}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#00000",
                padding: "12px 0",
              }}
            >
              {title}
            </div>
          </div>
          <div
            style={{
              fontSize: "7px",
              fontWeight: "400",
              color: "#797979",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "6px",
                fontWeight: "400",
                color: "#797979",
              }}
            >
              Checky
            </span>{" "}
            측정 결과
            <div
              style={{
                borderRadius: "50%",
                border: "1px solid #797979",
                width: "12px",
                height: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
              }}
            >
              ?
            </div>
          </div>
          <AdsWarning adsPercent={adsPercent} />
          <TagContainer tags={tagList} />
          <ChatText>{parse(replaceString)}</ChatText>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "8px 0",
              overflowX: "scroll",
            }}
          >
            {keywords.map((item, index) => {
              return (
                <a
                  key={index}
                  href={item.wikiUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div
                    style={{
                      width: "117px",
                      height: "60px",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "5px",
                      border: "0.5px solid #A02501",
                      fontSize: "9px",
                      fontWeight: "400",
                      padding: "4px 6px",
                    }}
                  >
                    {item.keyword}
                    <div
                      style={{
                        fontSize: "8px",
                        color: "#787878",
                        fontWeight: "400",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordWrap: "break-word",
                        lineHeight: "1.2em",
                        height: "3.6em",
                        WebkitLineClamp: 3,
                      }}
                    >
                      {parse(item.wikiContent)}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </AssistantChat>
      );
    } else {
      return (
        <AssistantChat {...restProps}>
          <ChatText>{chat.content}</ChatText>
        </AssistantChat>
      );
    }
  }

  return (
    <UserChat {...restProps}>
      <ChatText textAlign="end" bold>
        {chat.content.trim()}
      </ChatText>
    </UserChat>
  );
};

export const ChatBox = ({ chat, ...restProps }: ChatBoxProps) => {
  if (chat.role === "error") {
    return (
      <AssistantChat {...restProps}>
        <ChatText isError>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  if (chat.role === "assistant") {
    return (
      <AssistantChat {...restProps}>
        <ChatText>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  return (
    <UserChat {...restProps}>
      <ChatText bold textAlign="end">
        {chat.content.trim()}
      </ChatText>
    </UserChat>
  );
};

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}

const AdsWarning = ({ adsPercent }: { adsPercent: number }) => {
  const progressText = (adsPercent: number) => {
    if (adsPercent === 0) {
      return "이 글은 광고일리가 없어요.";
    } else if (adsPercent < 40) {
      return "이 글은 광고일 가능성이 낮아요.";
    } else if (adsPercent < 60) {
      return "이 글은 광고일 확률이 높아요.";
    } else if (adsPercent < 100) {
      return "🔪이 글은 99% 광고협찬 글이에요.🔪";
    } else {
      return "광고가 너무 많아요!";
    }
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ChatText bold>{progressText(adsPercent)}</ChatText>
      <Progress
        value={adsPercent}
        min={0}
        max={99}
        size="xs"
        colorScheme="pink"
        marginTop="8px"
      />
      <div
        style={{
          color: "#898989",
          fontSize: "6px",
          fontWeight: 400,
          textAlign: "right",
        }}
      >
        * GPT 모델과 Checky의 규칙 기반으로 분석되고 있어요.
      </div>
    </div>
  );
};

const StyledSwiper = styled(Swiper)`
  "& .swiper-wrapper" {
    display: flex !important;
  }
`;
