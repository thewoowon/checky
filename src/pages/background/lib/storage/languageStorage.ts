import { ILocalStorage, LocalStorage } from "@src/chrome/localStorage";

type Language = string;
const EMPTY_LANGUAGE = "";
export class LanguageStorage {
  private static LANGUAGE_KEY = "LANGUAGE_KEY";
  static storage: ILocalStorage = new LocalStorage();

  static async getLanguage(): Promise<Language> {
    try {
      return (await this.storage.load(this.LANGUAGE_KEY)) as Language;
    } catch (e) {
      return EMPTY_LANGUAGE;
    }
  }

  static async resetLanguage(): Promise<void> {
    await this.storage.save(this.LANGUAGE_KEY, EMPTY_LANGUAGE);
  }

  static async saveLanguage(Language: Language): Promise<void> {
    await this.storage.save(this.LANGUAGE_KEY, Language);
  }

  static async deleteLanguage(): Promise<void> {
    await this.storage.save(this.LANGUAGE_KEY, EMPTY_LANGUAGE);
  }
}
