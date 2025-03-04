import CONFIG from "../config/config";
import { AuthService } from "../services/auth-service";
import { AuthInfoType } from "../types/auth-info.type";
import { HttpMethod } from "../types/http-method.type";
import { RequestParametersType } from "../types/request-parameters.type";
import { RequestResultType } from "../types/request-result.type";
import { TokenKeyType } from "../types/token-key.type";
import { AuthUtils } from "./auth-utils";

export class HttpUtils {
  /**
   * Выполнить запрос.
   * @param {string} url
   * @param {HttpMethod} method Метод.
   * @param {boolean} useAuth Признак использования аутентификации.
   * @param {any} body Тело запроса.
   * @returns
   */
  static async request(
    url: string,
    method: HttpMethod = HttpMethod.GET,
    useAuth: boolean = true,
    body: any | null = null
  ): Promise<RequestResultType> {
    const result: RequestResultType = {
      error: false,
      response: null,
    };

    const params: RequestParametersType = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    let authInfo: AuthInfoType | null = null;
    if (useAuth) {
      authInfo = AuthUtils.getAuthInfo(TokenKeyType.accessTokenKey);
      if (authInfo?.accessToken) {
        params.headers["x-auth-token"] = authInfo.accessToken;
      }
    }

    if (body) {
      params.body = JSON.stringify(body);
    }

    let response: Response | null = null;
    try {
      response = await fetch(CONFIG.api + url, params);
      result.response = await response.json();
    } catch {
      result.error = true;

      // В бэкэнде не предусмотрен возврат кода 401, поэтому принудительно выходим из системы и отправляем на повторный вход.
      result.redirect = "/login";

      await AuthService.logout({
        refreshToken: AuthUtils.getAuthInfo(TokenKeyType.refreshTokenKey)
          ?.refreshToken,
      });

      AuthUtils.removeAuthInfo();

      return result;
    }

    if (response.status < 200 || response.status >= 300) {
      result.error = true;
      if (useAuth && response.status == 401) {
        if (!authInfo?.accessToken) {
          result.redirect = "/login";
        } else {
          const updateTokenResult: boolean =
            await AuthUtils.updateRefreshToken();
          if (updateTokenResult) {
            return this.request(url, method, useAuth, body);
          } else {
            result.redirect = "/login";
          }
        }
      }
    }

    return result;
  }
}
