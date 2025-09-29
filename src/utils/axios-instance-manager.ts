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
   * @returns The created AxiosInstance.
   */
  addAxiosInstance(appName: string, config: { baseURL: string; token: string }): AxiosInstance {
    const axiosInstance = Axios.create({
      baseURL: config.baseURL,
    });
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${config.token}`;
    this.instances.set(appName, axiosInstance);
    return axiosInstance;
  }

  /**
   * Get a named Axios instance.
   * @param appName The name/key of the instance.
   * @returns The AxiosInstance if it exists, undefined otherwise.
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
