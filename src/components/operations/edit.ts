import { BalanceService } from "../../services/balance-service";
import { ExpensesCategoryService } from "../../services/expenses-category-service";
import { IncomeCategoryService } from "../../services/income-category-service";
import { OperationsService } from "../../services/operations-service";
import { CategoryType } from "../../types/category.type";
import { OperationType } from "../../types/operation.type";
import {
  BalanceRequestResultType,
  CategoriesRequestResultType,
  OperationRequestResultType,
} from "../../types/request-result.type";
import { ValidationType } from "../../types/validation.type";
import { UrlUtils } from "../../utilities/url-utils";
import { ValidationUtils } from "../../utilities/validation-utils";

export class OperationsEdit {
  private openNewRoute: (url: string) => Promise<void>;
  private validations: ValidationType[] = [];
  private balanceElement: HTMLElement | null = null;
  private typeElement: HTMLElement | null = null;
  private categoryElement: HTMLElement | null = null;
  private amountElement: HTMLElement | null = null;
  private dateElement: HTMLElement | null = null;
  private commentElement: HTMLElement | null = null;
  private operationOriginalData: OperationType | null = null;

  constructor(openNewRoute: (url: string) => Promise<void>) {
    this.openNewRoute = openNewRoute;

    const id: number = parseInt(UrlUtils.getUrlParam("id") ?? "");
    if (!id) {
      this.openNewRoute("/operations");
      return;
    }

    this.findElements();

    document
      .getElementById("create-button")
      ?.addEventListener("click", this.saveOperation.bind(this));

    document
      .getElementById("cancel-button")
      ?.addEventListener("click", this.cancel.bind(this));

    if (this.typeElement) {
      this.typeElement.addEventListener("change", async () => {
        const categories: CategoryType[] | null = await this.getCategories(
          (this.typeElement as HTMLInputElement)?.value
        );

        if (categories) {
          this.populateCategoryControl(categories);
        }
      });
    }

    this.validations = [
      {
        element: this.typeElement as HTMLInputElement,
        options: { pattern: /^(?!Тип...).*$/ },
      },
      {
        element: this.categoryElement as HTMLInputElement,
        options: { pattern: /^(?!Категория...).*$/ },
      },
      {
        element: this.amountElement as HTMLInputElement,
        options: { pattern: /^\d*([.,])?\d+$/ },
      },
      { element: this.dateElement as HTMLInputElement },
      { element: this.commentElement as HTMLInputElement },
    ];

    if (this.dateElement) {
      this.dateElement.addEventListener("focus", function () {
        if ((this as HTMLInputElement).value) {
          const date: string[] = (this as HTMLInputElement).value.split(".");
          (this as HTMLInputElement).value = `${date[2]}-${date[1]}-${date[0]}`;
        }

        (this as HTMLInputElement).type = "date";
      });

      this.dateElement.addEventListener("blur", function () {
        (this as HTMLInputElement).type = "text";
        if ((this as HTMLInputElement).value) {
          const date: string[] = (this as HTMLInputElement).value.split("-");
          (this as HTMLInputElement).value = `${date[2]}.${date[1]}.${date[0]}`;
        }
      });
    }

    this.init(id).then();
  }

  /**
   * Найти элементы на странице.
   */
  private findElements(): void {
    this.typeElement = document.getElementById("type");
    this.categoryElement = document.getElementById("category");
    this.amountElement = document.getElementById("amount");
    this.dateElement = document.getElementById("date");
    this.commentElement = document.getElementById("comment");
    this.balanceElement = document.getElementById("balance");
  }

  /**
   * Инициализировать значения на странице.
   * @param {number} id Ид операции.
   */
  private async init(id: number): Promise<void> {
    const operation: OperationType | null = await this.getOperation(id);

    if (operation) {
      (this.typeElement as HTMLInputElement).value = operation.type; //= operation.type === "income" ? "Доход" : "Расход";
      (this.amountElement as HTMLInputElement).value =
        operation.amount.toString();
      (this.commentElement as HTMLInputElement).value =
        operation.comment as string;

      const categories: CategoryType[] | null = await this.getCategories(
        operation.type
      );

      if (categories) {
        this.populateCategoryControl(categories, operation.category);
      }

      const date: string[] = operation.date.split("-");
      (
        this.dateElement as HTMLInputElement
      ).value = `${date[2]}.${date[1]}.${date[0]}`;
    }

    await this.getBalance();
  }

  /**
   * Получить категории.
   * @param {string} type Тип.
   * @returns {Promise<CategoryType[] | null>} Категории.
   */
  private async getCategories(type: string): Promise<CategoryType[] | null> {
    const response: CategoriesRequestResultType =
      type === "income"
        ? await IncomeCategoryService.getCategories()
        : await ExpensesCategoryService.getCategories();

    if (response.error) {
      alert(response.message);
      if (response.redirect) {
        this.openNewRoute(response.redirect);
        return null;
      }
    }

    return response.categories;
  }

  /**
   * Заполнить контрол с категориями.
   * @param {CategoryType[]} categories Категории.
   * @param {CategoryType} currentCategory Текущая категория.
   */
  private populateCategoryControl(
    categories: CategoryType[],
    currentCategory?: string
  ): void {
    if (!this.categoryElement) {
      return;
    }

    const optionsToRemove: HTMLCollectionOf<HTMLOptionElement> =
      this.categoryElement.getElementsByTagName("option");

    for (
      let i: number = optionsToRemove.length - 1;
      optionsToRemove.length > 1;
      --i
    ) {
      this.categoryElement.removeChild(optionsToRemove[i]);
    }

    if (!categories) {
      return;
    }

    for (let i: number = 0; i < categories.length; ++i) {
      const optionElement: HTMLOptionElement = document.createElement("option");
      optionElement.value = categories[i].id?.toString() as string;
      optionElement.innerText = categories[i].title as string;
      if (currentCategory === categories[i].title) {
        optionElement.selected = true;
      }

      this.categoryElement.appendChild(optionElement);
    }
  }

  /**
   * Получить операцию.
   * @param {Number} id Ид операции.
   * @returns {Object} Операция.
   */
  private async getOperation(id: number): Promise<OperationType | null> {
    const result: OperationRequestResultType =
      await OperationsService.getOperation(id);
    if (result.redirect) {
      this.openNewRoute(result.redirect);
      return null;
    }

    if (result.error || !result.operation) {
      alert("Возникла ошибка при запросе категории доходов.");
      return null;
    }

    this.operationOriginalData = result.operation;

    return result.operation;
  }

  /**
   * Сохранить операцию.
   * @param {Object} e Аргумент события.
   * @returns
   */
  private async saveOperation(e: MouseEvent): Promise<void> {
    e.preventDefault();

    if (ValidationUtils.validateForm(this.validations)) {
      const date: string[] = (
        this.dateElement as HTMLInputElement
      )?.value.split(".");
      const dateISO: string = date ? `${date[2]}-${date[1]}-${date[0]}` : "";
      const changedData: OperationType = {
        type: (this.typeElement as HTMLInputElement)?.value,
        amount: parseInt((this.amountElement as HTMLInputElement)?.value) ?? 0,
        date: dateISO,
        comment: (this.commentElement as HTMLInputElement)?.value,
        category_id:
          parseInt((this.categoryElement as HTMLInputElement)?.value) ?? 0,
      };

      if (
        Object.keys(changedData).length > 0 &&
        this.operationOriginalData?.id
      ) {
        const response: OperationRequestResultType =
          await OperationsService.updateOperation(
            this.operationOriginalData.id,
            changedData
          );

        if (response.error) {
          alert(response.message);
          if (response.redirect) {
            this.openNewRoute(response.redirect);
            return;
          }
        }

        this.openNewRoute("/operations");
        return;
      }

      this.openNewRoute("/operations");
    }
  }

  /**
   * Отменить редактирование.
   * @param {MouseEvent} e Аргумент события.
   */
  private cancel(e: MouseEvent): void {
    e.preventDefault();

    this.openNewRoute("/operations");
  }

  /**
   * Получить баланс.
   * @returns {Promise<number | null>} Баланс.
   */
  private async getBalance(): Promise<number | null> {
    const result: BalanceRequestResultType = await BalanceService.getBalance();

    if (result.error || (result.balance && isNaN(result.balance))) {
      alert("Возникла ошибка при запросе баланса.");
      if (result.redirect) {
        this.openNewRoute(result.redirect);
      }
      return null;
    }

    if (this.balanceElement) {
      this.balanceElement.innerText = `${result.balance}$`;
    }

    return result.balance;
  }
}
