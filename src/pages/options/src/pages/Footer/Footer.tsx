import styled from "@emotion/styled";
import { t } from "@src/chrome/i18n";

const Footer = () => {
  return (
    <>
      <div
        style={{
          paddingTop: "6px",
        }}
      />
      <ATag href="mailto:thewoowon76@gmail.com">
        <Typography>{t("footer_EmailText")}</Typography>
      </ATag>
    </>
  );
};

export default Footer;

const Typography = styled.div`
  font-size: 18px;
  line-height: 1.5rem;
  font-weight: 400;
  color: #ced2da;
  padding: 10px 0;
`;

const ATag = styled.a`
  z-index: 1;
  color: #9746ff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
