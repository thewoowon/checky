import styled from "@emotion/styled";
import Tag from "./Tag";

export type TagObject = {
  id: number;
  name: string;
  color: string;
};

type TagContainerProps = {
  tags: TagObject[];
};

const TagContainer = ({ tags }: TagContainerProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        padding: "10px 0",
      }}
    >
      {tags.map((tag, index) => {
        return <Tag key={index} tag={tag} />;
      })}
    </div>
  );
};

export default TagContainer;
