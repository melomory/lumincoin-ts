import { FilterType } from "../types/filter-type";
import { HttpMethod } from "../types/http-method.type";
import {
  CategoryRequestResultType,
  DefaultRequestResultType,
  OperationRequestResultType,
  OperationsRequestResultType,
  RequestResultType,
} from "../types/request-result.type";
import { HttpUtils } from "../utilities/http-utils";

export class OperationsService {
  /**
   * Получить операции.
   * @param {FilterType} filter Условия фильтрации.
   * @returns {Array} Коллекция операций.
   */
  public static async getOperations(
    filter: FilterType
  ): Promise<OperationsRequestResultType> {
    const returnObject: OperationsRequestResultType = {
      error: false,
      redirect: null,
      operations: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      `/operations?period=${filter.period}&dateFrom=${filter.dateFrom}&dateTo=${filter.dateTo}`
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response && !Array.isArray(result.response))
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при запросе операций.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.operations = result.response;

    return returnObject;
  }

  /**
   * Создать операцию.
   * @param {*} data Данные для создания операции.
   * @returns {Promise<CategoryRequestResultType>} Категория.
   */
  public static async createOperation(
    data: any
  ): Promise<CategoryRequestResultType> {
    const returnObject: CategoryRequestResultType = {
      error: false,
      redirect: null,
      category: null,
    };

    const result = await HttpUtils.request(
      `/operations`,
      HttpMethod.POST,
      true,
      data
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response && !result.response.id)
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при создании операции.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.category = result.response;

    return returnObject;
  }

  /**
   * Удалить операцию.
   * @param {number} id Ид операции
   * @returns {Promise<DefaultRequestResultType>} Результат удаления.
   */
  static async deleteOperation(id: number): Promise<DefaultRequestResultType> {
    const returnObject: DefaultRequestResultType = {
      error: false,
      redirect: null,
    };

    const result = await HttpUtils.request(
      `/operations/${id}`,
      HttpMethod.DELETE,
      true
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response && result.response.error)
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при удалении операции.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    return returnObject;
  }

  /**
   * Получить операцию.
   * @param {number} id Ид операции.
   * @returns {Promise<OperationRequestResultType>} Операция.
   */
  public static async getOperation(
    id: number
  ): Promise<OperationRequestResultType> {
    const returnObject: OperationRequestResultType = {
      error: false,
      redirect: null,
      operation: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      `/operations/${id}`
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response &&
        !result.response.id &&
        !result.response.type &&
        !result.response.amount &&
        !result.response.date &&
        !result.response.comment &&
        !result.response.category)
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при запросе операций.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.operation = result.response;

    return returnObject;
  }

  /**
   * Обновить операцию.
   * @param {number} id Ид операции.
   * @param {*} data Данные для обновления операции.
   * @returns {Promise<OperationRequestResultType>} Обновленная операция.
   */
  public static async updateOperation(
    id: number,
    data: any
  ): Promise<OperationRequestResultType> {
    const returnObject: OperationRequestResultType = {
      error: false,
      redirect: null,
      operation: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      `/operations/${id}`,
      HttpMethod.PUT,
      true,
      data
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response && !result.response.id)
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при редактировании операции.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.operation = result.response;

    return returnObject;
  }
}
