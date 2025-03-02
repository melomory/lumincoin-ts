export type TokenResponseType = {
  tokens: TokenType;
};

export type TokenType = {
  accessToken: string;
  refreshToken: string;
};
