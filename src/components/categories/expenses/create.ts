import { BalanceService } from "../../../services/balance-service";
import { ExpensesCategoryService } from "../../../services/expenses-category-service";
import {
  BalanceRequestResultType,
  CategoryRequestResultType,
} from "../../../types/request-result.type";
import { ValidationType } from "../../../types/validation.type";
import { ValidationUtils } from "../../../utilities/validation-utils";

export class ExpensesCategoryCreate {
  private openNewRoute: Function;
  private validations: ValidationType[] = [];
  private categoryNameElement: HTMLElement | null = null;
  private balanceElement: HTMLElement | null = null;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;
    this.findElements();

    document
      .getElementById("create-button")
      ?.addEventListener("click", this.createCategory.bind(this));

    document
      .getElementById("cancel-button")
      ?.addEventListener("click", this.cancel.bind(this));

    this.validations = [
      { element: this.categoryNameElement as HTMLInputElement },
    ];
    this.getBalance().then();
  }

  /**
   * Найти элементы на странице.
   */
  private findElements(): void {
    this.categoryNameElement = document.getElementById("category-name");
    this.balanceElement = document.getElementById("balance");
  }

  /**
   * Создать категорию.
   * @param {MouseEvent} e Аргумент события.
   */
  private async createCategory(e: MouseEvent): Promise<void> {
    e.preventDefault();

    if (ValidationUtils.validateForm(this.validations)) {
      const createData = {
        title: (this.categoryNameElement as HTMLInputElement).value,
      };

      const response: CategoryRequestResultType =
        await ExpensesCategoryService.createCategory(createData);

      if (response.error) {
        alert(response.error);
        if (response.redirect) {
          this.openNewRoute(response.redirect);
          return;
        }
      }

      this.openNewRoute("/expenses");
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
