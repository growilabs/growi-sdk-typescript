import Axios, { type AxiosRequestConfig, type AxiosInstance } from 'axios';

/**
 * A singleton class for managing multiple named Axios instances.
 */
class AxiosInstanceManager {
  private instances: Map<string, AxiosInstance> = new Map();

  /**
   * Add or update a named Axios instance.
   * @param config The configuration for the Axios instance.
   * @param config.appName The name/key for the instance.
   * @param config.baseURL The base URL of the GROWI instance.
   * @param config.token The GROWI API token.
   * @param config.authorizationHeader Optional custom `Authorization` header value. When provided, it overrides the default
   *   Bearer scheme and the token is sent via the `X-GROWI-ACCESS-TOKEN` header instead. Useful when GROWI sits behind
   *   Digest, Basic, or custom proxy authentication.
   */
  addAxiosInstance(config: { appName: string; baseURL: string; token: string; authorizationHeader?: string }) {
    if (typeof config.appName !== 'string' || config.appName.length === 0) throw new Error('appName must be a non-empty string');
    if (typeof config.baseURL !== 'string' || config.baseURL.length === 0) throw new Error('baseURL must be a non-empty string');
    if (typeof config.token !== 'string' || config.token.length === 0) throw new Error('token must be a non-empty string');

    const axiosInstance = Axios.create({
      baseURL: config.baseURL,
    });

    // Set the Authorization header. When a custom authorization header is provided (e.g. Digest/Basic/proxy auth),
    // send the GROWI access token via X-GROWI-ACCESS-TOKEN instead of the default Bearer scheme.
    if (config.authorizationHeader) {
      axiosInstance.defaults.headers.common.Authorization = config.authorizationHeader;
      axiosInstance.defaults.headers.common['X-GROWI-ACCESS-TOKEN'] = config.token;
    } else {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${config.token}`;
    }

    this.instances.set(config.appName, axiosInstance);
  }

  /**
   * Get a named Axios instance.
   * @param appName The name/key of the instance.
   * @returns The AxiosInstance.
   * @throws Error if no instance is found for the given appName.
   */
  getAxiosInstance(appName: string): AxiosInstance {
    const instance = this.instances.get(appName);
    if (!instance) {
      throw new Error(`No Axios instance found for appName: ${appName}`);
    }
    return instance;
  }
}

// Export singleton instance
export const axiosInstanceManager = new AxiosInstanceManager();
