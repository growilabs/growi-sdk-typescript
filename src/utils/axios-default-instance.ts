import Axios from 'axios';

const DEFAULT_AXIOS_INSTANCE = Axios.create({
  baseURL: 'http://localhost', // set baseURL if you need
});

export const AXIOS_DEFAULT = {
  instance: DEFAULT_AXIOS_INSTANCE,
  /**
   * Set the base URL for the default Axios instance.
   * @param baseURL The base URL to set for the Axios instance.
   */
  setBaseURL: (baseURL: string): void => {
    DEFAULT_AXIOS_INSTANCE.defaults.baseURL = baseURL;
  },
  /**
   * Set the Authorization header for the default Axios instance.
   * @param token The authentication token to set in the Authorization header.
   */
  setAuthorizationHeader: (token: string): void => {
    DEFAULT_AXIOS_INSTANCE.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
};
