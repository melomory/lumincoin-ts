export class UrlUtils {
  /**
   * Получить значение параметра из строки запроса.
   * @param {string} param Параметр запроса.
   * @returns {string} Значение параметра запроса.
   */
  public static getUrlParam(param: string) {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
}
