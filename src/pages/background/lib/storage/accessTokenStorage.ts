import { ILocalStorage, LocalStorage } from "@src/chrome/localStorage";

type AccessToken = string;
const EMPTY_ACCESS_TOKEN = "";
export class AccessTokenStorage {
  private static ACCESS_TOKEN_KEY = "ACCESS_TOKEN_KEY";
  static storage: ILocalStorage = new LocalStorage();

  static async getAccessToken(): Promise<AccessToken> {
    try {
      return (await this.storage.load(this.ACCESS_TOKEN_KEY)) as AccessToken;
    } catch (e) {
      return EMPTY_ACCESS_TOKEN;
    }
  }

  static async resetAccessToken(): Promise<void> {
    await this.storage.save(this.ACCESS_TOKEN_KEY, EMPTY_ACCESS_TOKEN);
  }

  static async saveAccessToken(accessToken: AccessToken): Promise<void> {
    await this.storage.save(this.ACCESS_TOKEN_KEY, accessToken);
  }

  static async deleteAccessToken(): Promise<void> {
    await this.storage.save(this.ACCESS_TOKEN_KEY, EMPTY_ACCESS_TOKEN);
  }
}
