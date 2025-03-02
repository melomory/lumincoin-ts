import { AuthUtils } from "../../utilities/auth-utils";
import { AuthService } from "../../services/auth-service";
import { TokenKeyType } from "../../types/token-key.type";

export class Logout {
  private openNewRoute: Function;

  constructor(openNewRoute: Function) {
    this.openNewRoute = openNewRoute;

    if (
      !AuthUtils.getAuthInfo(TokenKeyType.accessTokenKey) ||
      !AuthUtils.getAuthInfo(TokenKeyType.refreshTokenKey)
    ) {
      return this.openNewRoute("/login");
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
