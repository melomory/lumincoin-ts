import { HttpMethod } from "../types/http-method.type";
import {
  AuthRequestResultType,
  RequestResultType,
} from "../types/request-result.type";
import { HttpUtils } from "../utilities/http-utils";

export class AuthService {
  /**
   * Войти в аккаунт.
   * @param {*} data
   * @returns {Promise<AuthRequestResultType>} Результат входа в аккаунт.
   */
  public static async login(data: any): Promise<AuthRequestResultType> {
    const returnObject: AuthRequestResultType = {
      error: false,
      redirect: null,
      message: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      "/login",
      HttpMethod.POST,
      false,
      data
    );

    if (
      result.error ||
      (result.response &&
        result.response.tokens &&
        (!result.response.tokens.accessToken ||
          !result.response.tokens.refreshToken) &&
        result.response.user &&
        (!result.response.user.id || !result.response.user.name))
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при входе в аккаунт";
      if (result.message) {
        returnObject.message = `${returnObject.message}: ${result.message}`;
      }

      return returnObject;
    }

    returnObject.tokens = result.response.tokens;
    returnObject.user = result.response.user;

    return returnObject;
  }

  /**
   * Зарегистрировать пользователя.
   * @param {*} data Данные для регистрации.
   * @returns {Promise<AuthRequestResultType>} Результат регистрации.
   */
  public static async signup(data: any): Promise<AuthRequestResultType> {
    const returnObject: AuthRequestResultType = {
      error: false,
      redirect: null,
      message: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      "/signup",
      HttpMethod.POST,
      false,
      data
    );

    if (
      result.error ||
      !result.response ||
      (result.response &&
        result.response.user &&
        (!result.response.user.id ||
          !result.response.user.email ||
          !result.response.user.name ||
          !result.response.user.lastName))
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при регистрации";
      if (result.message) {
        returnObject.message = `${returnObject.message}: ${result.message}`;
      }

      return returnObject;
    }

    returnObject.user = result.response.user;

    return returnObject;
  }

  /**
   * Выйти из аккаунта.
   * @param {*} data Данные для выхода.
   */
  public static async logout(data: any): Promise<AuthRequestResultType> {
    const returnObject: AuthRequestResultType = {
      error: false,
      redirect: null,
      message: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      "/logout",
      HttpMethod.POST,
      false,
      data
    );

    if (result.error || !result.response) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при выходе из аккаунта";
      returnObject.validation = result.response.validation;
      if (result.message) {
        returnObject.message = `${returnObject.message}: ${result.message}`;
      }

      return returnObject;
    }

    return returnObject;
  }
}
