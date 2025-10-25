import type { AxiosInstance } from 'axios';
import Axios from 'axios';
import { type MockedFunction, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosInstanceManager } from './axios-instance-manager.js';

// Mock Axios
vi.mock('axios');

const mockedAxios = vi.mocked(Axios);

describe('AxiosInstanceManager', () => {
  let mockAxiosInstance: AxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Axios instance
    mockAxiosInstance = {
      defaults: {
        headers: {
          common: {},
          'X-GROWI-ACCESS-TOKEN': undefined,
        },
      },
    } as unknown as AxiosInstance;

    // Mock Axios.create to return our mock instance
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    // Clear all instances after each test to ensure clean state
    // Since we can't access the private instances directly, we'll test each scenario independently
    vi.restoreAllMocks();
  });

  describe('addAxiosInstance', () => {
    it('should create an Axios instance with correct baseURL', () => {
      const config = {
        appName: 'test-app',
        baseURL: 'https://api.example.com',
        token: 'test-token',
      };

      axiosInstanceManager.addAxiosInstance(config);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
      });
    });

    it('should set Bearer token authorization when authorizationHeader is undefined', () => {
      const config = {
        appName: 'test-app',
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };

      axiosInstanceManager.addAxiosInstance(config);

      expect(mockAxiosInstance.defaults.headers.common.Authorization).toBe('Bearer test-token-123');
      expect(mockAxiosInstance.defaults.headers['X-GROWI-ACCESS-TOKEN']).toBeUndefined();
    });

    it('should set custom authorization header and GROWI access token when authorizationHeader is provided', () => {
      const config = {
        appName: 'test-app',
        baseURL: 'https://api.example.com',
        token: 'growi-token-456',
        authorizationHeader: 'Custom custom-auth-value',
      };

      axiosInstanceManager.addAxiosInstance(config);

      expect(mockAxiosInstance.defaults.headers.common.Authorization).toBe('Custom custom-auth-value');
      expect(mockAxiosInstance.defaults.headers['X-GROWI-ACCESS-TOKEN']).toBe('growi-token-456');
    });

    it('should handle multiple instances with different names', () => {
      const config1 = {
        appName: 'app1',
        baseURL: 'https://api1.example.com',
        token: 'token1',
      };

      const config2 = {
        appName: 'app2',
        baseURL: 'https://api2.example.com',
        token: 'token2',
        authorizationHeader: 'Bearer custom-token',
      };

      // Create first instance
      const mockInstance1 = {
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;

      // Create second instance
      const mockInstance2 = {
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;

      (mockedAxios.create as MockedFunction<typeof Axios.create>).mockReturnValueOnce(mockInstance1).mockReturnValueOnce(mockInstance2);

      axiosInstanceManager.addAxiosInstance(config1);
      axiosInstanceManager.addAxiosInstance(config2);

      expect(mockedAxios.create).toHaveBeenCalledTimes(2);
      expect(mockedAxios.create).toHaveBeenNthCalledWith(1, { baseURL: 'https://api1.example.com' });
      expect(mockedAxios.create).toHaveBeenNthCalledWith(2, { baseURL: 'https://api2.example.com' });

      expect(mockInstance1.defaults.headers.common.Authorization).toBe('Bearer token1');
      expect(mockInstance2.defaults.headers.common.Authorization).toBe('Bearer custom-token');
      expect(mockInstance2.defaults.headers['X-GROWI-ACCESS-TOKEN']).toBe('token2');
    });

    it('should overwrite existing instance when using same appName', () => {
      const config = {
        appName: 'same-app',
        baseURL: 'https://api.example.com',
        token: 'original-token',
      };

      const updatedConfig = {
        appName: 'same-app',
        baseURL: 'https://api-updated.example.com',
        token: 'updated-token',
        authorizationHeader: 'Bearer updated-auth',
      };

      // Create first instance
      const mockInstance1 = {
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;

      // Create second instance
      const mockInstance2 = {
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;

      (mockedAxios.create as MockedFunction<typeof Axios.create>).mockReturnValueOnce(mockInstance1).mockReturnValueOnce(mockInstance2);

      axiosInstanceManager.addAxiosInstance(config);
      axiosInstanceManager.addAxiosInstance(updatedConfig);

      expect(mockedAxios.create).toHaveBeenCalledTimes(2);
      expect(mockedAxios.create).toHaveBeenNthCalledWith(2, { baseURL: 'https://api-updated.example.com' });

      expect(mockInstance2.defaults.headers.common.Authorization).toBe('Bearer updated-auth');
      expect(mockInstance2.defaults.headers['X-GROWI-ACCESS-TOKEN']).toBe('updated-token');
    });

    it('should handle edge cases with empty appName', () => {
      const config = {
        appName: '',
        baseURL: 'https://api-v2.example.com',
        token: 'updated-token',
      };

      expect(() => {
        axiosInstanceManager.addAxiosInstance(config);
      }).toThrow('appName must be a non-empty string');
    });

    it('should handle edge cases with empty baseURL', () => {
      const config = {
        appName: 'app-name',
        baseURL: '',
        token: 'updated-token',
      };

      expect(() => {
        axiosInstanceManager.addAxiosInstance(config);
      }).toThrow('baseURL must be a non-empty string');
    });

    it('should handle edge cases with empty token', () => {
      const config = {
        appName: 'app-name',
        baseURL: 'https://api.example.com',
        token: '',
      };

      expect(() => {
        axiosInstanceManager.addAxiosInstance(config);
      }).toThrow('token must be a non-empty string');
    });
  });

  describe('getAxiosInstance', () => {
    it('should return the correct instance for a valid appName', () => {
      const config = {
        appName: 'valid-app',
        baseURL: 'https://api.example.com',
        token: 'test-token',
      };

      axiosInstanceManager.addAxiosInstance(config);
      const instance = axiosInstanceManager.getAxiosInstance('valid-app');

      expect(instance).toBe(mockAxiosInstance);
    });

    it('should throw an error for non-existent appName', () => {
      expect(() => {
        axiosInstanceManager.getAxiosInstance('non-existent-app');
      }).toThrow('No Axios instance found for appName: non-existent-app');
    });

    it('should throw an error with correct message format', () => {
      const invalidAppName = 'invalid-app-name-123';

      expect(() => {
        axiosInstanceManager.getAxiosInstance(invalidAppName);
      }).toThrow(`No Axios instance found for appName: ${invalidAppName}`);
    });

    it('should return different instances for different appNames', () => {
      const config1 = {
        appName: 'app1',
        baseURL: 'https://api1.example.com',
        token: 'token1',
      };

      const config2 = {
        appName: 'app2',
        baseURL: 'https://api2.example.com',
        token: 'token2',
      };

      const mockInstance1 = {
        id: 'instance1',
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;
      const mockInstance2 = {
        id: 'instance2',
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;

      (mockedAxios.create as MockedFunction<typeof Axios.create>).mockReturnValueOnce(mockInstance1).mockReturnValueOnce(mockInstance2);

      axiosInstanceManager.addAxiosInstance(config1);
      axiosInstanceManager.addAxiosInstance(config2);

      const instance1 = axiosInstanceManager.getAxiosInstance('app1');
      const instance2 = axiosInstanceManager.getAxiosInstance('app2');

      expect(instance1).toBe(mockInstance1);
      expect(instance2).toBe(mockInstance2);
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('integration tests', () => {
    it('should correctly manage the complete lifecycle of instances', () => {
      // Add first instance
      const config1 = {
        appName: 'lifecycle-app',
        baseURL: 'https://api.example.com',
        token: 'initial-token',
      };

      const mockInstance1 = {
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;

      (mockedAxios.create as MockedFunction<typeof Axios.create>).mockReturnValueOnce(mockInstance1);

      axiosInstanceManager.addAxiosInstance(config1);
      let instance = axiosInstanceManager.getAxiosInstance('lifecycle-app');

      expect(instance).toBe(mockInstance1);
      expect(instance.defaults.headers.common.Authorization).toBe('Bearer initial-token');

      // Update the same instance
      const config2 = {
        appName: 'lifecycle-app',
        baseURL: 'https://api-v2.example.com',
        token: 'updated-token',
        authorizationHeader: 'Custom auth-header',
      };

      const mockInstance2 = {
        defaults: {
          headers: {
            common: {},
            'X-GROWI-ACCESS-TOKEN': undefined,
          },
        },
      } as unknown as AxiosInstance;

      (mockedAxios.create as MockedFunction<typeof Axios.create>).mockReturnValueOnce(mockInstance2);

      axiosInstanceManager.addAxiosInstance(config2);
      instance = axiosInstanceManager.getAxiosInstance('lifecycle-app');

      expect(instance).toBe(mockInstance2);
      expect(instance.defaults.headers.common.Authorization).toBe('Custom auth-header');
      expect(instance.defaults.headers['X-GROWI-ACCESS-TOKEN']).toBe('updated-token');
    });
  });
});
