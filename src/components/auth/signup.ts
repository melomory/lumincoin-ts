import { AuthUtils } from "../../utilities/auth-utils";
import { ValidationUtils } from "../../utilities/validation-utils";
import { AuthService } from "../../services/auth-service";
import { TokenKeyType } from "../../types/token-key.type";
import { ValidationType } from "../../types/validation.type";

export class Signup {
  private openNewRoute: Function;
  private validations: ValidationType[] = [];
  private emailElement: HTMLElement | null = null;
  private passwordElement: HTMLElement | null = null;
  private passwordRepeatElement: HTMLElement | null = null;
  private fullNameElement: HTMLElement | null = null;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;

    if (AuthUtils.getAuthInfo(TokenKeyType.accessTokenKey)?.accessToken) {
      this.openNewRoute("/");
      return;
    }

    this.findElements();

    this.validations = [
      { element: this.fullNameElement as HTMLInputElement },
      {
        element: this.emailElement as HTMLInputElement,
        options: { pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
      },
      { element: this.passwordElement as HTMLInputElement },
      {
        element: this.passwordRepeatElement as HTMLInputElement,
        options: {
          compareTo: (this.passwordElement as HTMLInputElement)?.value,
        },
      },
    ];

    document
      .getElementById("process-button")
      ?.addEventListener("click", this.signUp.bind(this));
  }

  /**
   * Найти элементы.
   */
  private findElements(): void {
    this.fullNameElement = document.getElementById("full-name");
    this.emailElement = document.getElementById("email");
    this.passwordElement = document.getElementById("password");
    this.passwordRepeatElement = document.getElementById("password-repeat");
  }

  /**
   * Зарегистрировать.
   */
  private async signUp(): Promise<void> {
    for (let i = 0; i < this.validations.length; i++) {
      if (
        this.passwordRepeatElement &&
        this.validations[i].element === this.passwordRepeatElement &&
        this.validations[i].options
      ) {
        this.validations[i].options!.compareTo = (
          this.passwordRepeatElement as HTMLInputElement
        ).value;
      }
    }

    if (ValidationUtils.validateForm(this.validations)) {
      const [lastName, name] = (this.fullNameElement as HTMLInputElement).value
        .split(" ")
        .map((x) => x.trim());
      const signupResult = await AuthService.signup({
        name: name,
        lastName: lastName,
        email: (this.emailElement as HTMLInputElement).value,
        password: (this.passwordElement as HTMLInputElement).value,
        passwordRepeat: (this.passwordRepeatElement as HTMLInputElement).value,
      });

      if (signupResult) {
        this.openNewRoute("/login");
      } else {
        alert("Не удалось создать аккаунт.");
      }
    }
  }
}
