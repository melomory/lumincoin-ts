import Chart, {
  ChartConfiguration,
  ChartData,
  ChartItem,
  ChartTypeRegistry,
} from "chart.js/auto";
import { AuthUtils } from "../utilities/auth-utils";
import { BalanceService } from "../services/balance-service";
import { OperationsService } from "../services/operations-service";
import { TokenKeyType } from "../types/token-key.type";
import { FilterType } from "../types/filter-type";
import { BalanceRequestResultType } from "../types/request-result.type";
import { OperationType } from "../types/operation.type";
import { JsonUtils } from "../utilities/json-utils";

export class Main {
  private openNewRoute: (url: string) => Promise<void>;
  private currentFilter: FilterType | undefined;
  private periodFilterElements: HTMLInputElement[] | null = [];
  private optionIntervalFromElement: HTMLInputElement | null = null;
  private optionIntervalToElement: HTMLInputElement | null = null;
  private incomeChartElement: HTMLElement | null = null;
  private expensesChartElement: HTMLElement | null = null;
  private balanceElement: HTMLElement | null = null;
  private incomeChart: Chart<keyof ChartTypeRegistry, number[], string> | null =
    null;
  private expensesChart: Chart<
    keyof ChartTypeRegistry,
    number[],
    string
  > | null = null;

  constructor(openNewRoute: (url: string) => Promise<void>) {
    this.openNewRoute = openNewRoute;

    if (!AuthUtils.getAuthInfo(TokenKeyType.accessTokenKey)?.accessToken) {
      this.openNewRoute("/login");
      return;
    }

    this.findElements();

    this.currentFilter = JsonUtils.safeJsonParse(
      localStorage.getItem("main-filter") as string
    );

    if (!this.currentFilter) {
      this.currentFilter = {
        period: null,
        dateFrom: null,
        dateTo: null,
      };
    } else {
      if (this.periodFilterElements) {
        const periodFilterElement: HTMLInputElement | undefined = [
          ...this.periodFilterElements,
        ].filter((item) =>
          new RegExp(`${this.currentFilter?.period ?? "day"}`, "gi").test(
            item.id
          )
        )[0];

        if (periodFilterElement) {
          periodFilterElement.checked = true;
        }
      }

      if (this.optionIntervalFromElement) {
        if (this.currentFilter.dateFrom) {
          const date: string[] = this.currentFilter.dateFrom.split("-");
          this.optionIntervalFromElement.value = `${date[2]}.${date[1]}.${date[0]}`;
        } else {
          this.optionIntervalFromElement.value =
            this.currentFilter.dateFrom ?? "";
        }
      }

      if (this.optionIntervalToElement) {
        if (this.currentFilter.dateTo) {
          const date: string[] = this.currentFilter.dateTo.split("-");
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
              const date: string[] = this.value.split(".");
              this.value = `${date[2]}-${date[1]}-${date[0]}`;
            }

            this.type = "date";
          });
          item.addEventListener("blur", function () {
            this.type = "text";
            if (this.value) {
              const date: string[] = this.value.split("-");
              this.value = `${date[2]}.${date[1]}.${date[0]}`;
            }
          });
        }
      );
    }

    if (this.periodFilterElements) {
      [...this.periodFilterElements].forEach((item: HTMLInputElement) =>
        item.addEventListener("change", this.setFilter.bind(this))
      );
    }

    this.optionIntervalFromElement?.addEventListener(
      "blur",
      this.setFilter.bind(this)
    );

    this.optionIntervalToElement?.addEventListener(
      "blur",
      this.setFilter.bind(this)
    );

    this.init().then();
  }

  /**
   * Инициализировать данные на странице.
   */
  private async init(): Promise<void> {
    await this.setFilter();
    await this.getBalance();
  }

  /**
   * Найти элементы на странице.
   */
  private findElements(): void {
    this.incomeChartElement = document.getElementById("income-chart");
    this.expensesChartElement = document.getElementById("expenses-chart");
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
   * Задать фильтр.
   */
  private async setFilter(): Promise<void> {
    const current: HTMLInputElement | undefined =
      this.periodFilterElements?.filter((item) => item.checked)[0];

    if (this.currentFilter) {
      if (current) {
        this.currentFilter.period = current.id.replace("option-", "");
      }

      if (this.currentFilter.period === "interval") {
        if (
          this.optionIntervalFromElement &&
          this.optionIntervalFromElement.value &&
          this.optionIntervalFromElement.value !== this.currentFilter.dateFrom
        ) {
          const date: string[] =
            this.optionIntervalFromElement.value.split(".");
          this.currentFilter.dateFrom = `${date[2]}-${date[1]}-${date[0]}`;
        } else {
          this.currentFilter.dateFrom = null;
        }

        if (
          this.optionIntervalToElement &&
          this.optionIntervalToElement.value &&
          this.optionIntervalToElement.value !== this.currentFilter.dateFrom
        ) {
          const date: string[] = this.optionIntervalToElement.value.split(".");
          this.currentFilter.dateTo = `${date[2]}-${date[1]}-${date[0]}`;
        } else {
          this.currentFilter.dateTo = null;
        }
      }
    }

    localStorage.setItem("main-filter", JSON.stringify(this.currentFilter));

    await this.populateCharts();
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

  /**
   * Заполнить диаграммы.
   */
  private async populateCharts(): Promise<void> {
    if (!this.currentFilter) {
      return;
    }

    const operations: OperationType[] =
      (await OperationsService.getOperations(this.currentFilter))?.operations ||
      [];
    const income: OperationType[] = operations.filter(
      (item: OperationType) => item.type === "income"
    );
    const expenses: OperationType[] = operations.filter(
      (item: OperationType) => item.type === "expense"
    );
    const incomeGrouped: Partial<Record<string, OperationType[]>> =
      Object.groupBy(income, ({ category }) => category as string);
    const expensesGrouped: Partial<Record<string, OperationType[]>> =
      Object.groupBy(expenses, ({ category }) => category as string);

    const incomeData: ChartData<keyof ChartTypeRegistry, number[], string> = {
      labels: Object.keys(incomeGrouped),
      datasets: [
        {
          label: "Доходы",
          data: Object.keys(incomeGrouped).map((key) =>
            incomeGrouped[key]!.reduce(
              (result, item) => result + item.amount,
              0
            )
          ),
          backgroundColor: this.getBackgroundColors(income.length),
          hoverOffset: 4,
        },
      ],
    };

    const incomeConfig: ChartConfiguration<
      keyof ChartTypeRegistry,
      number[],
      string
    > = {
      type: "pie",
      data: incomeData,
    };

    const expensesData: ChartData<keyof ChartTypeRegistry, number[], string> = {
      labels: Object.keys(expensesGrouped),
      datasets: [
        {
          label: "Расходы",
          data: Object.keys(expensesGrouped).map((key) =>
            expensesGrouped[key]!.reduce(
              (result, item) => result + item.amount,
              0
            )
          ),
          backgroundColor: this.getBackgroundColors(expenses.length),
          hoverOffset: 4,
        },
      ],
    };

    const expensesConfig: ChartConfiguration<
      keyof ChartTypeRegistry,
      number[],
      string
    > = {
      type: "pie",
      data: expensesData,
    };

    if (this.incomeChartElement && this.expensesChartElement) {
      if (this.incomeChart) {
        this.incomeChart.destroy();
      }

      if (this.expensesChart) {
        this.expensesChart.destroy();
      }

      this.incomeChart = new Chart(
        this.incomeChartElement as ChartItem,
        incomeConfig
      );
      this.expensesChart = new Chart(
        this.expensesChartElement as ChartItem,
        expensesConfig
      );
    }
  }

  /**
   * Получить фоновые цвета для данных.
   * @param {number} length Длина массива данных.
   * @returns {string[]} Фоновые цвета.
   */
  private getBackgroundColors(length: number): string[] {
    const colors: string[] = [
      "#dc3545",
      "#fd7e14",
      "#ffc107",
      "#20c997",
      "#0d6efd",
    ];
    for (let i: number = colors.length - 1; i < length; ++i) {
      const red: number = Math.round(Math.random() * 255);
      const green: number = Math.round(Math.random() * 255);
      const blue: number = Math.round(Math.random() * 255);
      colors.push(`rgba(${red},${green},${blue}, 0.7)`);
    }

    return colors.slice(0, length);
  }
}
