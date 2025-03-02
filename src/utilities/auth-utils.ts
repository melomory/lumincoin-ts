import CONFIG from "../config/config";
import { AuthInfoType, UserInfo } from "../types/auth-info.type";
import { DefaultResponseType } from "../types/default-response.type";
import { TokenKeyType } from "../types/token-key.type";
import { TokenResponseType } from "../types/token-response.type";

export class AuthUtils {
  /**
   * Установить информацию об аутентификации в локальном хранилище.
   * @param {string} accessToken Токен доступа.
   * @param {string} refreshToken Токен обновления.
   * @param {string} userInfo Информация о пользователе.
   */
  public static setAuthInfo(
    accessToken: string,
    refreshToken: string,
    userInfo?: UserInfo
  ): void {
    localStorage.setItem(TokenKeyType.accessTokenKey, accessToken);
    localStorage.setItem(TokenKeyType.refreshTokenKey, refreshToken);
    if (userInfo) {
      localStorage.setItem(
        TokenKeyType.userInfoTokenKey,
        JSON.stringify(userInfo)
      );
    }
  }

  /**
   * Удалить информацию об аутентификации в локальном хранилище.
   */
  public static removeAuthInfo(): void {
    localStorage.removeItem(TokenKeyType.accessTokenKey);
    localStorage.removeItem(TokenKeyType.refreshTokenKey);
    localStorage.removeItem(TokenKeyType.userInfoTokenKey);
  }

  /**
   * Получить информацию об аутентификации из локального хранилища.
   * @param {string} key Ключ.
   * @returns
   */
  public static getAuthInfo(key: TokenKeyType | null = null): AuthInfoType {
    if (
      key &&
      [
        TokenKeyType.accessTokenKey,
        TokenKeyType.refreshTokenKey,
        TokenKeyType.userInfoTokenKey,
      ].includes(key)
    ) {
      return { [key]: localStorage.getItem(key) } as AuthInfoType;
    } else {
      return {
        accessToken: localStorage.getItem(TokenKeyType.accessTokenKey),
        refreshToken: localStorage.getItem(TokenKeyType.refreshTokenKey),
        userInfo: localStorage.getItem(TokenKeyType.userInfoTokenKey),
      } as AuthInfoType;
    }
  }

  /**
   * Обновить токен для обновления.
   * @returns {Promise<boolean>} Результат обновления.
   */
  public static async updateRefreshToken(): Promise<boolean> {
    let result: boolean = false;
    const authInfo: AuthInfoType = this.getAuthInfo(
      TokenKeyType.refreshTokenKey
    );
    if (authInfo.refreshToken) {
      const response: Response = await fetch(CONFIG.api + "/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken: authInfo.refreshToken }),
      });

      if (response && response.status === 200) {
        const tokensResponse: DefaultResponseType | TokenResponseType | null =
          await response.json();
        if (tokensResponse && !(tokensResponse as DefaultResponseType).error) {
          this.setAuthInfo(
            (tokensResponse as TokenResponseType).tokens.accessToken,
            (tokensResponse as TokenResponseType).tokens.refreshToken
          );
          result = true;
        }
      }
    }

    if (!result) {
      this.removeAuthInfo();
    }

    return result;
  }
}
