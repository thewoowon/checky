import { ChangeEventHandler, useState } from "react";
import { COLORS } from "@src/constant/style";
import { t } from "@src/chrome/i18n";
import styled from "@emotion/styled";
import Footer from "../Footer";

type NoApiKeyPageProps = {
  checkApiKey: (key: string) => void;
  apiKeyError?: Error;
  loading: boolean;
};
const NoApiKeyPage = ({
  loading,
  checkApiKey,
  apiKeyError,
}: NoApiKeyPageProps) => {
  const [apiKey, setApiKey] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setApiKey(event.target.value);
  };

  const onClickSaveButton = () => {
    checkApiKey(apiKey);
  };

  return (
    <>
      <VStack>
        {loading ? (
          <VStack>
            <div>{t("noApiKeyPage_checkingApiKey")}</div>
          </VStack>
        ) : (
          <>
            <HStack
              style={{
                gap: "6px",
              }}
            >
              <Input
                value={apiKey}
                type="password"
                onChange={handleChange}
                placeholder={t("noApiKeyPage_openAIApiKey_placeholder")}
              />
              <StyledButton onClick={onClickSaveButton}>
                {t("noApiKeyPage_saveButtonText")}
              </StyledButton>
            </HStack>

            <Typography>{t("noApiKeyPage_howToGetApiKey")}</Typography>
            <ol>
              <Li>
                {separateI18nAndAddLink(
                  t("noApiKeyPage_howToGetApiKeyDetail1"),
                  "https://platform.openai.com/signup"
                )}
              </Li>
              <Li>
                {separateI18nAndAddLink(
                  t("noApiKeyPage_howToGetApiKeyDetail2"),
                  "https://platform.openai.com/account/api-keys"
                )}
              </Li>
              <Li>{t("noApiKeyPage_howToGetApiKeyDetail3")}</Li>
              <Li>{t("noApiKeyPage_howToGetApiKeyDetail4")}</Li>
            </ol>
          </>
        )}
        {apiKeyError && (
          <VStack>
            <div color={COLORS.RED}>{apiKeyError.name}</div>
            <div color={COLORS.RED}>{apiKeyError.message}</div>
          </VStack>
        )}
      </VStack>
      <Footer />
    </>
  );
};

const separateI18nAndAddLink = (text: string, link: string) => {
  const [prev, rest] = text.split("{");
  const [linkText, next] = rest.split("}");
  return (
    <>
      {prev}
      <ATag href={link} target="_blank" rel="noreferrer">
        {linkText}
      </ATag>
      {next}
    </>
  );
};

const VStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  max-width: 600px;
  height: 100%;
  max-height: 400px;
  padding: 0 20px;
  box-sizing: border-box;
`;

const HStack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const StyledButton = styled.button`
  background: linear-gradient(90deg, #6713d3 0%, #9746ff 100%);
  font-size: 1.125rem;
  line-height: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  text-align: center;
  padding: 8px 20px;
  font-size: 18px;
`;

const Input = styled.input`
  width: 400px;
  height: 42px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 18px;
`;

const Typography = styled.div`
  font-size: 18px;
  line-height: 1.5rem;
  font-weight: 400;
  color: #ced2da;
  padding: 10px 0;
`;

const Li = styled.li`
  font-size: 18px;
  line-height: 1.5rem;
  font-weight: 400;
  color: #ced2da;
  padding: 10px 0;
`;

const ATag = styled.a`
  color: #9746ff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export default NoApiKeyPage;
