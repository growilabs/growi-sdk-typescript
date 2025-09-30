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
  addAxiosInstance(config: { appName: string; baseURL: string; token: string }) {
    const axiosInstance = Axios.create({
      baseURL: config.baseURL,
    });

    // Set the Authorization header
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${config.token}`;

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
