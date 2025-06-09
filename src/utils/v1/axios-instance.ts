import Axios, { type AxiosRequestConfig } from 'axios';
import { AXIOS_DEFAULT } from '../axios-default-instance.js';

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();

  const defaultInstance = AXIOS_DEFAULT.instance;
  const baseURL = `${options?.baseURL ?? config?.baseURL ?? defaultInstance.defaults.baseURL ?? ''}/_api`;

  const promise = AXIOS_DEFAULT.instance({
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
