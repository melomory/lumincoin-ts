import { ExpensesCategoryService } from "../../../services/expenses-category-service";
import { DefaultRequestResultType } from "../../../types/request-result.type";
import { UrlUtils } from "../../../utilities/url-utils";

export class ExpensesCategoryDelete {
  private openNewRoute: Function;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;
    const id = parseInt(UrlUtils.getUrlParam("id") ?? "");
    if (!id) {
      this.openNewRoute("/expenses");
      return;
    }

    document
      .getElementById("confirm-button")
      ?.addEventListener("click", () => this.deleteCategory(id));
    document
      .getElementById("cancel-button")
      ?.addEventListener("click", this.cancel.bind(this));
  }

  /**
   * Удалить категорию.
   * @param {number} id Ид категории.
   * @returns
   */
  private async deleteCategory(id: number): Promise<void> {
    const response: DefaultRequestResultType =
      await ExpensesCategoryService.deleteCategory(id);

    if (response.error) {
      alert(response.error);
      if (response.redirect) {
        this.openNewRoute(response.redirect);
        return;
      }
    }

    return this.openNewRoute("/expenses");
  }

  /**
   * Отменить удаление.
   * @param {MouseEvent} e Аргумент события.
   */
  private cancel(e: MouseEvent) {
    e.preventDefault();

    this.openNewRoute("/expenses");
  }
}
