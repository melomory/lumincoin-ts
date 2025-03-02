import { HttpMethod } from "./http-method.type";

export type RequestParametersType = {
  method: HttpMethod;
  headers: {
    "Content-Type": string;
    Accept: string;
    "x-auth-token"?: string;
  };
  body?: string;
};
