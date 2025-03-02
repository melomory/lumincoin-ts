import { BalanceService } from "../../services/balance-service";
import { OperationsService } from "../../services/operations-service";
import { FilterType } from "../../types/filter-type";
import { OperationType } from "../../types/operation.type";
import { BalanceRequestResultType } from "../../types/request-result.type";

export class OperationsList {
  private openNewRoute: Function;
  private balanceElement: HTMLElement | null = null;
  private currentFilter: FilterType | null = null;
  private optionIntervalFromElement: HTMLInputElement | null = null;
  private optionIntervalToElement: HTMLInputElement | null = null;
  private periodFilterElements: HTMLInputElement[] | null = [];

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;

    this.findElements();

    this.currentFilter = JSON.parse(localStorage.getItem("operations") ?? "");

    if (!this.currentFilter) {
      this.currentFilter = {
        period: null,
        dateFrom: null,
        dateTo: null,
      };
    } else {
      if (this.periodFilterElements) {
        [...this.periodFilterElements].filter((item: HTMLElement) =>
          new RegExp(`${this.currentFilter?.period ?? "day"}`, "gi").test(
            item.id
          )
        )[0].checked = true;
      }

      if (this.optionIntervalFromElement) {
        if (this.currentFilter.dateFrom) {
          let date = this.currentFilter.dateFrom.split("-");
          this.optionIntervalFromElement.value = `${date[2]}.${date[1]}.${date[0]}`;
        } else {
          this.optionIntervalFromElement.value =
            this.currentFilter.dateFrom ?? "";
        }
      }

      if (this.optionIntervalToElement) {
        if (this.currentFilter.dateTo) {
          let date = this.currentFilter.dateTo.split("-");
          this.optionIntervalToElement.value = `${date[2]}.${date[1]}.${date[0]}`;
        } else {
          this.optionIntervalToElement.value =
            this.currentFilter.dateFrom ?? "";
        }
      }
    }

    if (this.optionIntervalFromElement && this.optionIntervalToElement) {
      [this.optionIntervalFromElement, this.optionIntervalToElement].forEach(
        (item: HTMLInputElement) => {
          item.addEventListener("focus", function () {
            if (this.value) {
              let date = this.value.split(".");
              this.value = `${date[2]}-${date[1]}-${date[0]}`;
            }

            this.type = "date";
          });
          item.addEventListener("blur", function () {
            this.type = "text";
            if (this.value) {
              let date = this.value.split("-");
              this.value = `${date[2]}.${date[1]}.${date[0]}`;
            }
          });
        }
      );
    }

    if (this.periodFilterElements) {
      [...this.periodFilterElements].forEach((item) =>
        item.addEventListener("change", this.setFilter.bind(this))
      );
    }

    if (this.optionIntervalFromElement) {
      this.optionIntervalFromElement.addEventListener(
        "blur",
        this.setFilter.bind(this)
      );
    }

    if (this.optionIntervalToElement) {
      this.optionIntervalToElement.addEventListener(
        "blur",
        this.setFilter.bind(this)
      );
    }

    this.setFilter().then();
    this.getBalance().then();
  }

  /**
   * Найти элементы на странице.
   */
  private findElements(): void {
    this.periodFilterElements = Array.from(
      document.querySelectorAll("[name=dates]")
    );
    this.optionIntervalFromElement = document.getElementById(
      "option-interval-from"
    ) as HTMLInputElement;
    this.optionIntervalToElement = document.getElementById(
      "option-interval-to"
    ) as HTMLInputElement;
    this.balanceElement = document.getElementById("balance");
  }

  /**
   * Получить операции.
   * @returns {string} Маршрут перенаправления.
   */
  private async getOperations(): Promise<void> {
    if (!this.currentFilter) {
      throw new Error("Ошибка. Не установлен фильтр");
    }

    const response = await OperationsService.getOperations(this.currentFilter);

    if (response.error) {
      alert(response.error);
      if (response.redirect) {
        this.openNewRoute(response.redirect);
        return;
      }
    }

    this.showRecords(response.operations);
  }

  /**
   * Задать фильтр.
   */
  private async setFilter(): Promise<void> {
    if (!this.periodFilterElements) {
      return;
    }

    const current = [...this.periodFilterElements].filter(
      (item) => item.checked
    )[0];

    if (!this.currentFilter) {
      return;
    }

    this.currentFilter.period = current.id.replace("option-", "");

    if (this.currentFilter.period === "interval") {
      if (
        this.optionIntervalFromElement &&
        this.optionIntervalFromElement.value &&
        this.optionIntervalFromElement.value !== this.currentFilter.dateFrom
      ) {
        let date = this.optionIntervalFromElement.value.split(".");
        this.currentFilter.dateFrom = `${date[2]}-${date[1]}-${date[0]}`;
      } else {
        this.currentFilter.dateFrom = null;
      }

      if (
        this.optionIntervalToElement &&
        this.optionIntervalToElement.value &&
        this.optionIntervalToElement.value !== this.currentFilter.dateFrom
      ) {
        let date = this.optionIntervalToElement.value.split(".");
        this.currentFilter.dateTo = `${date[2]}-${date[1]}-${date[0]}`;
      } else {
        this.currentFilter.dateTo = null;
      }
    }

    localStorage.setItem("operations", JSON.stringify(this.currentFilter));

    await this.getOperations();
  }

  /**
   * Отобразить операции на странице.
   * @param {Object} operations Операции.
   */
  private showRecords(operations: OperationType[] | null): void {
    const recordsElement: HTMLElement | null =
      document.getElementById("records");
    if (!recordsElement) {
      return;
    }

    recordsElement.replaceChildren();

    if (!operations) {
      return;
    }

    for (let i = 0; i < operations.length; i++) {
      const trElement: HTMLTableRowElement = document.createElement("tr");

      const operationIdCell = trElement.insertCell();
      operationIdCell.classList.add("fw-bold");
      operationIdCell.innerText = operations[i].id?.toString() as string;

      const operationTypeCell: HTMLTableCellElement = trElement.insertCell();
      if (operations[i].type === "income") {
        operationTypeCell.classList.add("text-success");
        operationTypeCell.innerText = "доход";
      } else {
        operationTypeCell.classList.add("text-danger");
        operationTypeCell.innerText = "расход";
      }

      trElement.insertCell().innerText = operations[i].category as string;
      trElement.insertCell().innerText = `${operations[i].amount}$`;
      trElement.insertCell().innerText = operations[i].date;
      trElement.insertCell().innerText = operations[i].comment as string;

      const gridToolsCell = trElement.insertCell();
      const gridToolsWrapper = document.createElement("div");
      gridToolsWrapper.classList.add("d-flex", "gap-2", "tools");

      const deleteTool = document.createElement("a");
      deleteTool.href = `/operations/delete?id=${operations[i].id}`;
      deleteTool.setAttribute("data-bs-toggle", "modal");
      deleteTool.setAttribute("data-bs-target", "#delete-action");

      const deleteToolImage = document.createElement("img");
      deleteToolImage.src = "/assets/images/icons/trash.svg";

      deleteTool.appendChild(deleteToolImage);

      const editTool = document.createElement("a");
      editTool.href = `/operations/edit?id=${operations[i].id}`;

      const editToolImage = document.createElement("img");
      editToolImage.src = "/assets/images/icons/pen.svg";

      editTool.appendChild(editToolImage);

      gridToolsWrapper.appendChild(deleteTool);
      gridToolsWrapper.appendChild(editTool);
      gridToolsCell.appendChild(gridToolsWrapper);

      recordsElement.appendChild(trElement);
    }
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
