import { Login } from "./components/auth/login";
import { Logout } from "./components/auth/logout";
import { Signup } from "./components/auth/signup";
import { ExpensesCategoryCreate } from "./components/categories/expenses/create";
import { ExpensesCategoryDelete } from "./components/categories/expenses/delete";
import { ExpensesCategoryEdit } from "./components/categories/expenses/edit";
import { ExpensesCategoryList } from "./components/categories/expenses/list";
import { IncomeCategoryCreate } from "./components/categories/income/create";
import { IncomeCategoryDelete } from "./components/categories/income/delete";
import { IncomeCategoryEdit } from "./components/categories/income/edit";
import { IncomeCategoryList } from "./components/categories/income/list";
import { OperationsCreate } from "./components/operations/create";
import { OperationsDelete } from "./components/operations/delete";
import { OperationsEdit } from "./components/operations/edit";
import { OperationsList } from "./components/operations/list";
import { Main } from "./components/main";
import { AuthUtils } from "./utilities/auth-utils";
import { RouteType } from "./types/route.type";
import { TokenKeyType } from "./types/token-key.type";
import { AuthInfoType, UserInfo } from "./types/auth-info.type";
import { JsonUtils } from "./utilities/json-utils";
import { AuthService } from "./services/auth-service";

export class Router {
  readonly titlePageElement: HTMLElement | null;
  readonly contentPageElement: HTMLElement | null;
  private profileNameElement: HTMLElement | null;
  private routes: RouteType[];
  private userInfo: UserInfo | undefined;

  constructor() {
    this.titlePageElement = document.getElementById("title");
    this.contentPageElement = document.getElementById("content");
    this.profileNameElement = null;

    this.initEvents();

    this.routes = [
      {
        route: "/404",
        title: "Страница не найдена",
        filePathPage: "/pages/404.html",
      },
      {
        route: "/",
        title: "Главная",
        filePathPage: "/pages/main.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new Main(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/login",
        title: "Вход в систему",
        filePathPage: "/pages/auth/login.html",
        useLayout: "",
        load: () => {
          new Login(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/signup",
        title: "Регистрация",
        filePathPage: "/pages/auth/signup.html",
        useLayout: "",
        load: () => {
          new Signup(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/logout",
        load: () => {
          new Logout(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/operations",
        title: "Доходы & Расходы",
        filePathPage: "/pages/operations/list.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new OperationsList(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/operations/create",
        title: "Создание дохода/расхода",
        filePathPage: "/pages/operations/create.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new OperationsCreate(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/operations/edit",
        title: "Редактирование дохода/расхода",
        filePathPage: "/pages/operations/edit.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new OperationsEdit(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/operations/delete",
        load: () => {
          new OperationsDelete(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/income",
        title: "Доходы",
        filePathPage: "/pages/categories/income/list.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new IncomeCategoryList(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/income/create",
        title: "Создание категории доходов",
        filePathPage: "/pages/categories/income/create.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new IncomeCategoryCreate(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/income/edit",
        title: "Редактирование категории доходов",
        filePathPage: "/pages/categories/income/edit.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new IncomeCategoryEdit(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/income/delete",
        load: () => {
          new IncomeCategoryDelete(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/expenses",
        title: "Расходы",
        filePathPage: "/pages/categories/expenses/list.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new ExpensesCategoryList(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/expenses/create",
        title: "Создание категории расходов",
        filePathPage: "/pages/categories/expenses/create.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new ExpensesCategoryCreate(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/expenses/edit",
        title: "Редактирование категории расходов",
        filePathPage: "/pages/categories/expenses/edit.html",
        useLayout: "/layouts/main.html",
        load: () => {
          new ExpensesCategoryEdit(this.openNewRoute.bind(this));
        },
      },
      {
        route: "/expenses/delete",
        load: () => {
          new ExpensesCategoryDelete(this.openNewRoute.bind(this));
        },
      },
    ];
  }

  /**
   * Инициализировать события после загрузки.
   */
  private initEvents(): void {
    window.addEventListener("DOMContentLoaded", this.activateRoute.bind(this));
    window.addEventListener("popstate", this.activateRoute.bind(this));
    window.addEventListener("click", this.clickHandler.bind(this));
  }

  /**
   * Перейти по новому пути.
   * @param {string} url - Путь.
   */
  public async openNewRoute(url: string): Promise<void> {
    history.pushState({}, "", url);
    await this.activateRoute();
  }

  /**
   * Установить маршрут.
   */
  private async activateRoute(): Promise<void> {
    const urlRoute: string = window.location.pathname;
    const newRoute: RouteType | undefined = this.routes.find(
      (item) => item.route === urlRoute
    );

    if (newRoute) {
      if (newRoute.title && this.titlePageElement) {
        this.titlePageElement.innerText = newRoute.title + " | Lumincoin";
      }

      if (newRoute.filePathPage) {
        let contentBlock: HTMLElement | null = this.contentPageElement;
        if (newRoute.useLayout) {
          if (this.contentPageElement) {
            this.contentPageElement.innerHTML = await fetch(
              newRoute.useLayout
            ).then((response: Response) => response.text());
          }

          contentBlock = document.getElementById("content-layout");
          if (contentBlock) {
            contentBlock.innerHTML = await fetch(newRoute.filePathPage).then(
              (response) => response.text()
            );
          }

          this.profileNameElement = document.getElementById("profile-name");

          if (!this.userInfo) {
            const authInfo: AuthInfoType = AuthUtils.getAuthInfo(
              TokenKeyType.userInfoTokenKey
            );

            if (authInfo?.userInfo) {
              this.userInfo = JsonUtils.safeJsonParse(authInfo.userInfo);
            }

            if (!authInfo?.userInfo || !this.userInfo) {
              await AuthService.logout({
                refreshToken: AuthUtils.getAuthInfo(
                  TokenKeyType.refreshTokenKey
                )?.refreshToken,
              });

              AuthUtils.removeAuthInfo();

              this.openNewRoute("/login");
              return;
            }
          }

          if (this.profileNameElement && this.userInfo?.name) {
            this.profileNameElement.innerText = this.userInfo.name;
          }

          this.activateMenuItem(newRoute);
        }

        if (contentBlock) {
          contentBlock.innerHTML = await fetch(newRoute.filePathPage).then(
            (response) => response.text()
          );
        }
      }

      if (newRoute.load && typeof newRoute.load === "function") {
        newRoute.load();
      }
    } else {
      console.log("No route found");
      history.pushState({}, "", "/404");
      await this.activateRoute();
    }
  }

  /**
   * Активировать пункт меню.
   * @param {RouteType} route - Маршрут.
   */
  private activateMenuItem(route: RouteType): void {
    document.querySelectorAll(".sidebar .nav-link").forEach((item: Element) => {
      const href: string | null = item.getAttribute("href");
      if (
        (new RegExp(`(^${href}$)|(^${href}/)`).test(route.route) &&
          href !== "/") ||
        (route.route === "/" && href === "/")
      ) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * Обработчик нажатия кнопки мыши.
   * @param {MouseEvent} e Аргумент события.
   * @returns
   */
  private async clickHandler(e: MouseEvent): Promise<void> {
    if (!e) {
      return;
    }

    let element: HTMLElement | ParentNode | null = null;
    if ((e.target as HTMLElement)?.nodeName === "A") {
      element = e.target as HTMLElement;
    } else if ((e.target as HTMLElement)?.parentNode?.nodeName === "A") {
      element = (e.target as HTMLElement).parentNode;
    }

    if (element && (element as HTMLAnchorElement)) {
      e.preventDefault();

      const currentRoute: string = window.location.pathname;
      const url: string = (element as HTMLAnchorElement).href.replace(
        window.location.origin,
        ""
      );
      if (
        !url ||
        currentRoute === url.replace("#", "") ||
        url.startsWith("javascript:void(0)")
      ) {
        return;
      }

      await this.openNewRoute(url);
    }
  }
}
