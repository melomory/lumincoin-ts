export type ValidationType = {
  element: HTMLInputElement;
  options?: OptionType;
};

export type OptionType = {
  pattern?: RegExp;
  compareTo?: string;
};
