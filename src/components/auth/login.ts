import { AuthUtils } from "../../utilities/auth-utils";
import { ValidationUtils } from "../../utilities/validation-utils";
import { AuthService } from "../../services/auth-service";
import { TokenKeyType } from "../../types/token-key.type";
import { ValidationType } from "../../types/validation.type";
import { AuthRequestResultType } from "../../types/request-result.type";

export class Login {
  private openNewRoute: (url: string) => Promise<void>;
  private validations: ValidationType[] = [];
  private emailElement: HTMLElement | null = null;
  private passwordElement: HTMLElement | null = null;
  private rememberMeElement: HTMLElement | null = null;

  constructor(openNewRoute: (url: string) => Promise<void>) {
    this.openNewRoute = openNewRoute;

    if (AuthUtils.getAuthInfo(TokenKeyType.accessTokenKey)?.accessToken) {
      this.openNewRoute("/");
      return;
    }

    this.findElements();

    this.validations = [
      {
        element: this.emailElement as HTMLInputElement,
        options: { pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
      },
      { element: this.passwordElement as HTMLInputElement },
    ];

    document
      ?.getElementById("process-button")
      ?.addEventListener("click", this.login.bind(this));
  }

  /**
   * Найти элементы.
   */
  private findElements(): void {
    this.emailElement = document.getElementById("email");
    this.passwordElement = document.getElementById("password");
    this.rememberMeElement = document.getElementById("remember-me");
  }

  private async login(): Promise<void> {
    if (ValidationUtils.validateForm(this.validations)) {
      const loginResult: AuthRequestResultType = await AuthService.login({
        email: (this.emailElement as HTMLInputElement).value,
        password: (this.passwordElement as HTMLInputElement).value,
        rememberMe: (this.rememberMeElement as HTMLInputElement).checked,
      });

      if (loginResult && loginResult.tokens && loginResult.user) {
        AuthUtils.setAuthInfo(
          loginResult.tokens.accessToken,
          loginResult.tokens.refreshToken,
          {
            id: loginResult.user.id,
            name: loginResult.user.name,
            lastName: loginResult.user.lastName,
          }
        );

        this.openNewRoute("/");
      } else {
        alert("Неверный логин или пароль.");
      }
    }
  }
}
