import Axios, { type AxiosRequestConfig, type AxiosInstance } from 'axios';

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
