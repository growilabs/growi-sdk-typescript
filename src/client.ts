import Axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getGrowirestapiv1 } from './generated/v1/index.js';
import { getGrowirestapiv3 } from './generated/v3/index.js';

export interface GrowiClientConfig {
  baseURL: string;
  token: string;
  axiosConfig?: AxiosRequestConfig;
}

export class GrowiClient {
  private axiosInstance: AxiosInstance;
  public readonly v1: ReturnType<typeof getGrowirestapiv1>;
  public readonly v3: ReturnType<typeof getGrowirestapiv3>;

  constructor(config: GrowiClientConfig) {
    this.axiosInstance = Axios.create({
      baseURL: config.baseURL,
      ...config.axiosConfig,
    });

    // Set authorization header
    this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${config.token}`;

    // Create API instances with this client's axios instance
    this.v1 = getGrowirestapiv1(this.axiosInstance);
    this.v3 = getGrowirestapiv3(this.axiosInstance);
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default GrowiClient;
