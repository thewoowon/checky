import styled from "@emotion/styled";

type TagObject = {
  id: number;
  name: string;
  color: string;
};

type TagProps = {
  tag: TagObject;
};

const Tag = ({ tag }: TagProps) => {
  return (
    <div
      style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "white",
        backgroundColor: tag.color || "black",
        padding: "0.6rem 1.5rem",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        lineHeight: "14px",
      }}
    >
      {tag.name}
    </div>
  );
};

export default Tag;
