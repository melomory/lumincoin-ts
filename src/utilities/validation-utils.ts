import { OptionType, ValidationType } from "../types/validation.type";

export class ValidationUtils {
  public static validateForm(validations: ValidationType[]): boolean {
    let isValid: boolean = true;

    for (let i: number = 0; i < validations.length; i++) {
      if (
        !ValidationUtils.validateField(
          validations[i].element,
          validations[i].options
        )
      ) {
        isValid = false;
      }
    }

    return isValid;
  }

  private static validateField(element: HTMLInputElement, options?: OptionType): boolean {
    if (!element) {
      return false;
    }

    let condition: boolean = Boolean(element.value);
    if (options) {
      if (options.pattern) {
        condition = Boolean(element.value) && options.pattern.test(element.value);
      } else if (options.compareTo) {
        condition = Boolean(element.value) && element.value === options.compareTo;
      }
      // else if (options.hasOwnProperty("checkProperty")) {
      //   condition = options.checkProperty;
      // } else if (options.hasOwnProperty("checked")) {
      //   condition = options.checked;
      // }
    }

    if (condition) {
      element.classList.remove("is-invalid");
      return true;
    }

    element.classList.add("is-invalid");
    return false;
  }
}
