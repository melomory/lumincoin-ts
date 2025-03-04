import { IncomeCategoryService } from "../../../services/income-category-service";
import { DefaultRequestResultType } from "../../../types/request-result.type";
import { UrlUtils } from "../../../utilities/url-utils";

export class IncomeCategoryDelete {
  private openNewRoute: (url: string) => Promise<void>;

  constructor(openNewRoute: (url: string) => Promise<void>) {
    this.openNewRoute = openNewRoute;

    const id: number = parseInt(UrlUtils.getUrlParam("id") ?? "");
    if (!id) {
      this.openNewRoute("/income");
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
   */
  private async deleteCategory(id: number): Promise<void> {
    const response: DefaultRequestResultType =
      await IncomeCategoryService.deleteCategory(id);

    if (response.error) {
      alert(response.message);
      if (response.redirect) {
        this.openNewRoute(response.redirect);
        return;
      }
    }

    this.openNewRoute("/income");
  }

  /**
   * Отменить удаление.
   * @param {MouseEvent} e Аргумент события.
   */
  private cancel(e: MouseEvent): void {
    e.preventDefault();

    this.openNewRoute("/income");
  }
}
