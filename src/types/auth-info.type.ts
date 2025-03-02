export type AuthInfoType = {
  accessToken?: string;
  refreshToken?: string;
  userInfo?: string;
};

export type UserInfo = {
  id: string;
  name: string;
  lastName?: string;
  email?: string;
};
