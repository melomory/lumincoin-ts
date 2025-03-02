import { BalanceService } from "../../services/balance-service";
import { ExpensesCategoryService } from "../../services/expenses-category-service";
import { IncomeCategoryService } from "../../services/income-category-service";
import { OperationsService } from "../../services/operations-service";
import { CategoryType } from "../../types/category.type";
import {
  BalanceRequestResultType,
  CategoriesRequestResultType,
  CategoryRequestResultType,
} from "../../types/request-result.type";
import { ValidationType } from "../../types/validation.type";
import { UrlUtils } from "../../utilities/url-utils";
import { ValidationUtils } from "../../utilities/validation-utils";

export class OperationsCreate {
  private openNewRoute: Function;
  private validations: ValidationType[] = [];
  private typeElement: HTMLElement | null = null;
  private categoryElement: HTMLElement | null = null;
  private amountElement: HTMLElement | null = null;
  private dateElement: HTMLElement | null = null;
  private commentElement: HTMLElement | null = null;
  private balanceElement: HTMLElement | null = null;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;

    this.findElements();

    document
      .getElementById("create-button")
      ?.addEventListener("click", this.createOperation.bind(this));

    document
      .getElementById("cancel-button")
      ?.addEventListener("click", this.cancel.bind(this));

    if (this.typeElement) {
      this.typeElement.addEventListener("change", async () => {
        const categories = await this.getCategories(
          (this.typeElement as HTMLInputElement).value
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
          let date = (this as HTMLInputElement).value.split(".");
          (this as HTMLInputElement).value = `${date[2]}-${date[1]}-${date[0]}`;
        }

        (this as HTMLInputElement).type = "date";
      });

      this.dateElement.addEventListener("blur", function () {
        (this as HTMLInputElement).type = "text";
        if ((this as HTMLInputElement).value) {
          let date = (this as HTMLInputElement).value.split("-");
          (this as HTMLInputElement).value = `${date[2]}.${date[1]}.${date[0]}`;
        }
      });
    }

    this.init().then();
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
   */
  private async init(): Promise<void> {
    const type = UrlUtils.getUrlParam("type");
    if (type && this.typeElement) {
      (this.typeElement as HTMLInputElement).value = type;

      const categories: CategoryType[] | null = await this.getCategories(type);

      if (categories) {
        this.populateCategoryControl(categories);
      }
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
      alert(response.error);
      if (response.redirect) {
        this.openNewRoute(response.redirect);
        return null;
      }
    }

    return response.categories;
  }

  /**
   * Заполнить контрол с категориями.
   * @param {Array} categories Категории.
   */
  private populateCategoryControl(categories: CategoryType[] | null): void {
    if (!this.categoryElement) {
      return;
    }

    const optionsToRemove = this.categoryElement.getElementsByTagName("option");

    for (let i = optionsToRemove.length - 1; optionsToRemove.length > 1; --i) {
      this.categoryElement.removeChild(optionsToRemove[i]);
    }

    if (!categories) {
      return;
    }

    for (let i = 0; i < categories.length; ++i) {
      const optionElement: HTMLOptionElement = document.createElement("option");
      optionElement.value = categories[i].id?.toString() as string;
      optionElement.innerText = categories[i].title as string;

      this.categoryElement.appendChild(optionElement);
    }
  }

  /**
   * Создать операцию.
   * @param {Object} e Аргумент события.
   * @returns {Object} Созданная операция.
   */
  private async createOperation(e: MouseEvent): Promise<void> {
    e.preventDefault();

    if (ValidationUtils.validateForm(this.validations)) {
      const date: string[] | null = (
        this.dateElement as HTMLInputElement
      )?.value.split(".");
      const dateISO: string = `${date[2]}-${date[1]}-${date[0]}`;

      const createData = {
        type: (this.typeElement as HTMLInputElement).value,
        category_id: parseInt((this.categoryElement as HTMLInputElement).value),
        amount: (this.amountElement as HTMLInputElement).value,
        date: dateISO,
        comment: (this.commentElement as HTMLInputElement).value,
      };

      const response: CategoryRequestResultType =
        await OperationsService.createOperation(createData);

      if (response.error) {
        alert(response.error);
        if (response.redirect) {
          this.openNewRoute(response.redirect);
          return;
        }
      }

      this.openNewRoute("/operations");
    }
  }

  /**
   * Отменить создание.
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
      return null;
    }

    if (this.balanceElement) {
      this.balanceElement.innerText = `${result.balance}$`;
    }

    return result.balance;
  }
}
