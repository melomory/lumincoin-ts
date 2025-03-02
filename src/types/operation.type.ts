import { CategoryType } from "./category.type";

export type OperationType = {
  id?: number;
  type: string;
  amount: number;
  date: string;
  comment?: string;
  category_id?: number
  category?: string;
};
