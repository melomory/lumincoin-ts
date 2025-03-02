import { OperationsService } from "../../services/operations-service";
import { UrlUtils } from "../../utilities/url-utils";

export class OperationsDelete {
  private openNewRoute: Function;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;

    const id = parseInt(UrlUtils.getUrlParam("id") ?? "");
    if (!id) {
      this.openNewRoute("/operations");
      return;
    }

    document
      .getElementById("confirm-button")
      ?.addEventListener("click", () => this.deleteOperation(id));
    document
      .getElementById("cancel-button")
      ?.addEventListener("click", this.cancel.bind(this));
  }

  /**
   * Удалить операцию.
   * @param {number} id Ид операции.
   */
  private async deleteOperation(id: number): Promise<void> {
    const response = await OperationsService.deleteOperation(id);

    if (response.error) {
      alert(response.error);
      if (response.redirect) {
        this.openNewRoute(response.redirect);
        return;
      }
    }

    this.openNewRoute("/operations");
  }

  /**
   * Отменить удаление.
   * @param {MouseEvent} e Аргумент события.
   */
  private cancel(e: MouseEvent): void {
    e.preventDefault();

    window.history.pushState({}, "", "/operations");
  }
}
