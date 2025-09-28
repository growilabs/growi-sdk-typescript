import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import Axios from 'axios';

/**
 * Creates a custom axios instance wrapper for a specific GROWI client
 */
export function createV3CustomInstance(axiosInstance: AxiosInstance) {
  return <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    const source = Axios.CancelToken.source();
    const baseURL = `${axiosInstance.defaults.baseURL}/_api/v3`;

    const promise = axiosInstance({
      ...config,
      ...options,
      baseURL,
      cancelToken: source.token,
    }).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => {
      source.cancel('Query cancelled');
    };

    return promise;
  };
}

/**
 * Creates a custom axios instance wrapper for V1 API
 */
export function createV1CustomInstance(axiosInstance: AxiosInstance) {
  return <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    const source = Axios.CancelToken.source();
    const baseURL = `${axiosInstance.defaults.baseURL}/_api`;

    const promise = axiosInstance({
      ...config,
      ...options,
      baseURL,
      cancelToken: source.token,
    }).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => {
      source.cancel('Query cancelled');
    };

    return promise;
  };
}
