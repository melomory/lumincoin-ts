import {
  BalanceRequestResultType,
  RequestResultType,
} from "../types/request-result.type";
import { HttpUtils } from "../utilities/http-utils";

export class BalanceService {
  /**
   * Получить баланс.
   * @returns {Promise<BalanceRequestResultType>} Баланс.
   */
  public static async getBalance(): Promise<BalanceRequestResultType> {
    const returnObject: BalanceRequestResultType = {
      error: false,
      redirect: null,
      balance: null,
      message: null,
    };

    const result: RequestResultType = await HttpUtils.request("/balance");

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response &&
        (result.response.error || isNaN(result.response.balance)))
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при запросе баланса.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }

      return returnObject;
    }

    returnObject.balance = result.response.balance;

    return returnObject;
  }
}
