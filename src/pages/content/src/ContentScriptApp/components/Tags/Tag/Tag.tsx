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
        fontSize: "8px",
        fontWeight: 700,
        color: "white",
        backgroundColor: tag.color || "white",
        padding: "4px 10px",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {tag.name}
    </div>
  );
};

export default Tag;
