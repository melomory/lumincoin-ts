import { BalanceService } from "../../../services/balance-service";
import { ExpensesCategoryService } from "../../../services/expenses-category-service";
import { CategoryType } from "../../../types/category.type";
import {
  BalanceRequestResultType,
  CategoriesRequestResultType,
} from "../../../types/request-result.type";

export class ExpensesCategoryList {
  private openNewRoute: Function;
  private balanceElement: HTMLElement | null = null;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;

    this.balanceElement = document.getElementById("balance");

    this.getCategories();
    this.getBalance().then();
  }

  /**
   * Получить категории.
   */
  private async getCategories(): Promise<void> {
    const response: CategoriesRequestResultType =
      await ExpensesCategoryService.getCategories();

    if (response.error) {
      alert(response.error);
      if (response.redirect) {
        this.openNewRoute(response.redirect);
        return;
      }
    }

    this.show(response.categories);
  }

  /**
   * Отобразить категории на странице.
   * @param {CategoryType[]} categories Категории.
   */
  private show(categories: CategoryType[] | null) {
    const categoriesElement = document.getElementById("categories");

    if (!categoriesElement || !categories) {
      return;
    }

    for (let i = 0; i < categories.length; i++) {
      const cardElement: HTMLElement = document.createElement("div");
      cardElement.classList.add("card", "p-1");

      const cardBodyElement: HTMLElement = document.createElement("div");
      cardBodyElement.classList.add("card-body");

      const cardTitleElement: HTMLElement = document.createElement("h2");
      cardTitleElement.classList.add("card-title", "fs-3");
      cardTitleElement.setAttribute("data-bs-toggle", "tooltip");
      cardTitleElement.setAttribute("title", "Депозиты");
      cardTitleElement.innerText = categories[i].title ?? "";

      const cardEditButtonElement: HTMLAnchorElement =
        document.createElement("a");
      cardEditButtonElement.classList.add("btn", "btn-primary", "me-2");
      cardEditButtonElement.href = `/expenses/edit?id=${categories[i].id}`;
      cardEditButtonElement.innerText = "Редактировать";

      const cardDeleteButtonElement: HTMLAnchorElement =
        document.createElement("a");
      cardDeleteButtonElement.classList.add("btn", "btn-danger");
      cardDeleteButtonElement.href = `/expenses/delete?id=${categories[i].id}`;
      cardDeleteButtonElement.setAttribute("data-bs-toggle", "modal");
      cardDeleteButtonElement.setAttribute("data-bs-target", "#delete-action");
      cardDeleteButtonElement.innerText = "Удалить";

      cardBodyElement.appendChild(cardTitleElement);
      cardBodyElement.appendChild(cardEditButtonElement);
      cardBodyElement.appendChild(cardDeleteButtonElement);
      cardElement.appendChild(cardBodyElement);

      categoriesElement.appendChild(cardElement);
    }

    const cardEmptyElement = document.createElement("div");
    cardEmptyElement.classList.add(
      "card",
      "p-1",
      "blank",
      "fs-3",
      "d-flex",
      "align-items-center",
      "justify-content-center"
    );
    cardEmptyElement.onclick = () => this.openNewRoute("/expenses/create");

    const signElement: HTMLElement = document.createElement("p");
    signElement.classList.add("add-sign");
    signElement.innerText = "+";

    cardEmptyElement.appendChild(signElement);
    categoriesElement.appendChild(cardEmptyElement);
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
