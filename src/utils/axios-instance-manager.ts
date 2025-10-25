import Axios, { type AxiosRequestConfig, type AxiosInstance } from 'axios';

/**
 * A singleton class for managing multiple named Axios instances.
 */
class AxiosInstanceManager {
  private instances: Map<string, AxiosInstance> = new Map();

  /**
   * Add or update a named Axios instance.
   * @param appName The name/key for the instance.
   * @param config The configuration for the Axios instance.
   */
  addAxiosInstance(config: { appName: string; baseURL: string; token: string; authorizationHeader: string | undefined }) {
    if (config.appName.length === 0) throw new Error('appName must be a non-empty string');
    if (config.baseURL.length === 0) throw new Error('baseURL must be a non-empty string');
    if (config.token.length === 0) throw new Error('token must be a non-empty string');

    const axiosInstance = Axios.create({
      baseURL: config.baseURL,
    });

    // Set the Authorization header
    if (config.authorizationHeader) {
      axiosInstance.defaults.headers.common.Authorization = config.authorizationHeader;
      axiosInstance.defaults.headers['X-GROWI-ACCESS-TOKEN'] = config.token;
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
