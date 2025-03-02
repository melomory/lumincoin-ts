import { UserInfo } from "./auth-info.type";
import { CategoryType } from "./category.type";
import { OperationType } from "./operation.type";
import { TokenResponseType, TokenType } from "./token-response.type";

export type DefaultRequestResultType = {
  error?: boolean;
  redirect?: string | null;
  message?: string | null;
};

export type RequestResultType = DefaultRequestResultType & {
  response?: any;
};

export type BalanceRequestResultType = DefaultRequestResultType & {
  balance: number | null;
};

export type OperationsRequestResultType = DefaultRequestResultType & {
  operations: OperationType[] | null;
};

export type OperationRequestResultType = DefaultRequestResultType & {
  operation: OperationType | null;
};

export type CategoryRequestResultType = DefaultRequestResultType & {
  category: CategoryType | null;
};

export type CategoriesRequestResultType = DefaultRequestResultType & {
  categories: CategoryType[] | null;
};

export type AuthRequestResultType = DefaultRequestResultType & {
  validation?: { key: string; message: string };
  tokens?: TokenType;
  user?: UserInfo;
};
