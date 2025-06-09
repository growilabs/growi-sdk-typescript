import Axios, { type AxiosRequestConfig } from 'axios';

export const DEFAULT_AXIOS_INSTANCE = Axios.create({
  baseURL: 'http://localhost', // set baseURL if you need
});

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = DEFAULT_AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query cancelled');
  };

  return promise;
};
