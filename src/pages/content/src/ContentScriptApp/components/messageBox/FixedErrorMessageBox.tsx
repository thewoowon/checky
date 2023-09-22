import styled from "@emotion/styled";
import { t } from "@src/chrome/i18n";
import FixedMessageBox, { FixedMessageBoxProps } from "./FixedMessageBox";

const ErrorHeaderText = styled.div`
  font-weight: bold;
  color: #ea3737;
`;

type ErrorMessageBoxProps = Omit<
  FixedMessageBoxProps,
  "header" | "content" | "width"
> & {
  error?: Error;
};

export default function FixedErrorMessageBox({
  error,
  ...restProps
}: ErrorMessageBoxProps) {
  return (
    <FixedMessageBox
      header={
        <ErrorHeaderText>{`${t("errorMessageBox_errorTitle")}: ${
          error?.name ?? t("errorMessageBox_unknownError")
        }`}</ErrorHeaderText>
      }
      width={400}
      content={error?.message ?? t("errorMessageBox_unknownError")}
      {...restProps}
    />
  );
}
