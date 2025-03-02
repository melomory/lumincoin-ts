import { HttpMethod } from "../types/http-method.type";
import {
  CategoriesRequestResultType,
  CategoryRequestResultType,
  DefaultRequestResultType,
  RequestResultType,
} from "../types/request-result.type";
import { HttpUtils } from "../utilities/http-utils";

export class ExpensesCategoryService {
  /**
   * Получить категории.
   * @returns {Promise<CategoriesRequestResultType>} Коллекция категорий.
   */
  public static async getCategories(): Promise<CategoriesRequestResultType> {
    const returnObject: CategoriesRequestResultType = {
      error: false,
      redirect: null,
      categories: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      "/categories/expense"
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response && !Array.isArray(result.response))
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при запросе категорий расходов.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.categories = result.response;

    return returnObject;
  }

  /**
   * Получить категорию.
   * @param {number} id Ид категории.
   * @returns {Promise<CategoryRequestResultType>} Результат запроса.
   */
  public static async getCategory(
    id: number
  ): Promise<CategoryRequestResultType> {
    const returnObject: CategoryRequestResultType = {
      error: false,
      redirect: null,
      category: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      `/categories/expense/${id}`
    );

    if (result.redirect || result.error || !result.response) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при запросе категории расходов.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.category = result.response;

    return returnObject;
  }

  /**
   * Удалить категорию.
   * @param {number} id Ид категории.
   * @returns {Promise<DefaultRequestResultType>} Результат удаления.
   */
  public static async deleteCategory(
    id: number
  ): Promise<DefaultRequestResultType> {
    const returnObject: DefaultRequestResultType = {
      error: false,
      redirect: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      `/categories/expense/${id}`,
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
      returnObject.message = "Возникла ошибка при удалении категории.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    return returnObject;
  }

  /**
   * Обновить категорию.
   * @param {number} id Ид категории.
   * @param {*} data Данные для обновления.
   * @returns {Promise<CategoryRequestResultType>} Результат обновления.
   */
  public static async updateCategory(
    id: number,
    data: any
  ): Promise<CategoryRequestResultType> {
    const returnObject: CategoryRequestResultType = {
      error: false,
      redirect: null,
      category: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      `/categories/expense/${id}`,
      HttpMethod.PUT,
      true,
      data
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response && !result.response.id && !result.response.title)
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при редактировании категории.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.category = result.response;

    return returnObject;
  }

  /**
   * Создать категорию.
   * @param {*} data Данные для создания категории.
   * @returns {Promise<CategoryRequestResultType>} Категория.
   */
  public static async createCategory(
    data: any
  ): Promise<CategoryRequestResultType> {
    const returnObject: CategoryRequestResultType = {
      error: false,
      redirect: null,
      category: null,
    };

    const result: RequestResultType = await HttpUtils.request(
      `/categories/expense`,
      HttpMethod.POST,
      true,
      data
    );

    if (
      result.redirect ||
      result.error ||
      !result.response ||
      (result.response && !result.response.id && !result.response.title)
    ) {
      returnObject.error = true;
      returnObject.message = "Возникла ошибка при создании категории.";
      if (result.redirect) {
        returnObject.redirect = result.redirect;
      }
      return returnObject;
    }

    returnObject.category = result.response;

    return returnObject;
  }
}
