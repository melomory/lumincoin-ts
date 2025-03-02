import { BalanceService } from "../../../services/balance-service";
import { IncomeCategoryService } from "../../../services/income-category-service";
import { CategoryType } from "../../../types/category.type";
import {
  BalanceRequestResultType,
  CategoriesRequestResultType,
  CategoryRequestResultType,
} from "../../../types/request-result.type";
import { ValidationType } from "../../../types/validation.type";
import { UrlUtils } from "../../../utilities/url-utils";
import { ValidationUtils } from "../../../utilities/validation-utils";

export class IncomeCategoryEdit {
  private openNewRoute: Function;
  private validations: ValidationType[] = [];
  private categoryNameElement: HTMLElement | null = null;
  private balanceElement: HTMLElement | null = null;
  private categoryOriginalData: CategoryType | null = null;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;

    const id = parseInt(UrlUtils.getUrlParam("id") ?? "");
    if (!id) {
      this.openNewRoute("/income");
      return;
    }

    this.findElements();

    document
      .getElementById("save-button")
      ?.addEventListener("click", this.saveCategory.bind(this));

    document
      .getElementById("cancel-button")
      ?.addEventListener("click", this.cancel.bind(this));

    this.validations = [
      { element: this.categoryNameElement as HTMLInputElement },
    ];

    this.init(id).then();
  }

  /**
   * Найти элементы на странице.
   */
  private findElements(): void {
    this.categoryNameElement = document.getElementById("category-name");
    this.balanceElement = document.getElementById("balance");
  }

  /**
   * Инициализировать значения на странице.
   * @param {number} id Ид категории.
   */
  async init(id: number) {
    const category = await this.getCategory(id);
    if (category) {
      (this.categoryNameElement as HTMLInputElement).value = category.title as string;
    }

    await this.getBalance();
  }

  /**
   * Получить категорию.
   * @param {number} id Ид категории.
   * @returns {Promise<CategoryType | null>} Категория.
   */
  private async getCategory(id: number): Promise<CategoryType | null> {
    const result: CategoryRequestResultType =
      await IncomeCategoryService.getCategory(id);
    if (result.redirect) {
      this.openNewRoute(result.redirect);
      return null;
    }

    if (
      result.error ||
      !result.category ||
      (result.category && !result.category.title)
    ) {
      alert("Возникла ошибка при запросе категории доходов.");
      return null;
    }

    this.categoryOriginalData = result.category;

    return result.category;
  }

  /**
   * Сохранить категорию.
   * @param {MouseEvent} e Аргумент события.
   * @returns
   */
  private async saveCategory(e: MouseEvent): Promise<void> {
    e.preventDefault();

    if (ValidationUtils.validateForm(this.validations)) {
      const changedData: CategoryType = {};

      if (
        this.categoryNameElement &&
        (this.categoryNameElement as HTMLInputElement)?.value !==
          this.categoryOriginalData?.title
      ) {
        changedData.title = (
          this.categoryNameElement as HTMLInputElement
        ).value;
      }

      if (
        Object.keys(changedData).length > 0 &&
        this.categoryOriginalData?.id
      ) {
        const response = await IncomeCategoryService.updateCategory(
          this.categoryOriginalData.id,
          changedData
        );

        if (response.error) {
          alert(response.error);
          if (response.redirect) {
            this.openNewRoute(response.redirect);
            return;
          }
        }

        this.openNewRoute("/income");
        return;
      }

      this.openNewRoute("/income");
    }
  }

  /**
   * Отменить редактирование.
   * @param {MouseEvent} e Аргумент события.
   */
  private cancel(e: MouseEvent): void {
    e.preventDefault();

    this.openNewRoute("/expenses");
  }

  /**
   * Получить баланс.
   * @returns {Promise<number | null>} Баланс.
   */
  private async getBalance(): Promise<number | null> {
    const result: BalanceRequestResultType = await BalanceService.getBalance();

    if (result.error || (result.balance && isNaN(result.balance))) {
      alert("Возникла ошибка при запросе баланса.");
      return null;
    }

    if (this.balanceElement) {
      this.balanceElement.innerText = `${result.balance}$`;
    }

    return result.balance;
  }
}
