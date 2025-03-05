import { AuthUtils } from "../../utilities/auth-utils";
import { AuthService } from "../../services/auth-service";
import { TokenKeyType } from "../../types/token-key.type";

export class Logout {
  private openNewRoute: (url: string) => Promise<void>;

  constructor(openNewRoute: (url: string) => Promise<void>) {
    this.openNewRoute = openNewRoute;

    if (
      !AuthUtils.getAuthInfo(TokenKeyType.accessTokenKey)?.accessToken ||
      !AuthUtils.getAuthInfo(TokenKeyType.refreshTokenKey)?.refreshToken
    ) {
      this.openNewRoute("/login");
      return;
    }

    this.logout().then();
  }

  /**
   * Выйти из аккаунта.
   */
  private async logout(): Promise<void> {
    await AuthService.logout({
      refreshToken: AuthUtils.getAuthInfo(TokenKeyType.refreshTokenKey)?.refreshToken,
    });

    AuthUtils.removeAuthInfo();

    this.openNewRoute("/login");
  }
}
