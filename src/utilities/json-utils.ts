export class JsonUtils {

  /**
   * Безопасно распарсить json-строку в объект.
   * @param {string} string
   * @returns
   */
  public static safeJsonParse<T>(string: string) {
    try {
      const jsonValue: T = JSON.parse(string);

      return jsonValue;
    } catch {
      return undefined;
    }
  }
}
