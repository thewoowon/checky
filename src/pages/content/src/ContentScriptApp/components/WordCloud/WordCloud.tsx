import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import ReactWordcloud, {
  Word,
  MinMaxPair,
  Optional,
  Options,
} from "react-wordcloud";

const handleGetWordColor = (word: Word) => {
  // 구간을 10개로 나누어서 색을 다르게 표현
  switch (Math.trunc(word.value / 10)) {
    case 0:
      return "#934A5F";
    case 1:
      return "#D3AC2B";
    case 2:
      return "#A3C6C4";
    case 3:
      return "#9F4298";
    case 4:
      return "#CFDB31";
    case 5:
      return "#F6C026";
    case 6:
      return "#A0D3F9";
    case 7:
      return "#C4BA3B";
    case 8:
      return "#E2495B";
    case 9:
      return "#ED7458";
    case 10:
      return "#FFDC9F";
    default:
      return "#EF6C33";
  }
};

const wordsTemplate = [
  {
    text: "데카르트",
    value: 4,
  },
  {
    text: "강아지",
    value: 64,
  },
  {
    text: "아기",
    value: 11,
  },
  {
    text: "실수",
    value: 16,
  },
  {
    text: "사랑",
    value: 17,
  },
  {
    text: "팀애드",
    value: 100,
  },
  {
    text: "크립토",
    value: 55,
  },
  {
    text: "비트코인",
    value: 45,
  },
  {
    text: "어메이징",
    value: 35,
  },
  {
    text: "라면F4",
    value: 97,
  },
  {
    text: "아버지",
    value: 4,
  },
  {
    text: "누가",
    value: 64,
  },
  {
    text: "바나나",
    value: 11,
  },
  {
    text: "사과",
    value: 16,
  },
  {
    text: "러브",
    value: 17,
  },
  {
    text: "쿠리아",
    value: 100,
  },
  {
    text: "바다",
    value: 55,
  },
  {
    text: "에어팟",
    value: 45,
  },
  {
    text: "언듀",
    value: 35,
  },
  {
    text: "오늘",
    value: 104,
  },
];

const callbacks = {
  getSelection: console.log,
  getWordColor: handleGetWordColor,
  onWordClick: console.log,
  onWordMouseOver: console.log,
  getWordTooltip: (word: Word) =>
    `${word.text} (${word.value}) [${word.value > 50 ? "good" : "bad"}]`,
};

const options: Optional<Options> = {
  rotations: 1,
  rotationAngles: [0, 0],
  enableOptimizations: true,
};

const size: MinMaxPair = [300, 300];

export type WordcloudProps = {
  words?: Word[];
};

const Wordcloud = ({ words }: WordcloudProps) => {
  if (!words) return null;

  return (
    <Container>
      <ReactWordcloud
        callbacks={callbacks}
        options={options}
        size={size}
        words={words}
      />
    </Container>
  );
};

export default Wordcloud;

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;
