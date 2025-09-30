import Axios, { type AxiosRequestConfig } from 'axios';
import { axiosInstanceManager } from '../axios-instance-manager.js';
import type { CustomInstanceOptions } from '../types/custom-instance.js';

export const customInstance = <T>(config: AxiosRequestConfig, options?: CustomInstanceOptions): Promise<T> => {
  const { appName, axiosOptions } = options ?? {};

  if (appName == null) {
    throw new Error('appName is required');
  }

  const source = Axios.CancelToken.source();

  const instance = axiosInstanceManager.getAxiosInstance(appName);
  const baseURL = `${axiosOptions?.baseURL ?? config?.baseURL ?? instance.defaults.baseURL ?? ''}/_api/v3`;

  const promise = instance({
    ...config,
    ...axiosOptions,
    baseURL,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query cancelled');
  };

  return promise;
};
