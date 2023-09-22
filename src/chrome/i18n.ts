import type KoMessage from "../../public/_locales/ko/messages.json";
import type EnMessage from "../../public/_locales/en/messages.json";

type MessageKey = typeof KoMessage | typeof EnMessage;

export function t(messageNameKey: keyof MessageKey) {
  return chrome.i18n.getMessage(messageNameKey);
}
