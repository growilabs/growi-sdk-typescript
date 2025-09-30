import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Axios from 'axios';
/**
 * Tests for v3/axios-instance.ts
 *
 * This file provides custom Axios instance creation functionality for GROWI API v3,
 * including automatic base URL configuration (with v3 suffix), cancellation capability, and request configuration merging.
 */
import { type MockedFunction, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosInstanceManager } from '../axios-instance-manager.js';
import { customInstance } from './axios-instance.js';

// Mock Axios
vi.mock('axios');
vi.mock('../axios-instance-manager.js');

const mockedAxios = vi.mocked(Axios);
const mockedAxiosInstanceManager = vi.mocked(axiosInstanceManager);

// Type for the promise returned by customInstance with cancel functionality
type CancellablePromise<T> = Promise<T> & {
  cancel: () => void;
};

describe('v3 customInstance', () => {
  let mockCancelTokenSource: {
    token: string;
    cancel: MockedFunction<() => void>;
  };
  let mockAxiosInstance: MockedFunction<(config: AxiosRequestConfig) => Promise<AxiosResponse<unknown>>>;
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock for CancelTokenSource
    mockCancelTokenSource = {
      token: 'mock-cancel-token',
      cancel: vi.fn(),
    };

    // Mock for Axios.CancelToken.source
    mockedAxios.CancelToken = {
      source: vi.fn().mockReturnValue(mockCancelTokenSource),
    } as unknown as typeof Axios.CancelToken;

    // Mock for Axios instance
    mockAxiosInstance = vi.fn().mockResolvedValue({
      data: { result: 'success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as AxiosResponse<{ result: string }>);

    // Create a mock AxiosInstance with defaults
    const mockInstance = mockAxiosInstance as unknown as AxiosInstance;
    Object.defineProperty(mockInstance, 'defaults', {
      value: {
        baseURL: 'http://localhost',
        headers: {
          common: {},
          delete: {},
          get: {},
          head: {},
          post: {},
          put: {},
          patch: {},
        },
      },
      writable: true,
      configurable: true,
    });

    // Mock for axiosInstanceManager
    mockedAxiosInstanceManager.getAxiosInstance.mockReturnValue(mockInstance);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Base URL configuration', () => {
    it('should append _api/v3 suffix to default base URL', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      await customInstance(config, { appName: 'testApp' });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost/_api/v3',
          cancelToken: 'mock-cancel-token',
        }),
      );
    });

    it('should append _api/v3 suffix to baseURL specified in options', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };
      const options: AxiosRequestConfig = { baseURL: 'https://custom.example.com' };

      // Act
      await customInstance(config, { appName: 'testApp', axiosOptions: options });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://custom.example.com/_api/v3',
        }),
      );
    });

    it('should append _api/v3 suffix to baseURL specified in config', async () => {
      // Arrange
      const config: AxiosRequestConfig = {
        method: 'GET',
        url: '/test',
        baseURL: 'https://config.example.com',
      };

      // Act
      await customInstance(config, { appName: 'testApp' });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://config.example.com/_api/v3',
        }),
      );
    });

    it('should set only _api/v3 when baseURL is empty string', async () => {
      // Arrange
      const mockInstance = mockAxiosInstance as unknown as AxiosInstance;
      Object.defineProperty(mockInstance, 'defaults', {
        value: { baseURL: '' },
        writable: true,
        configurable: true,
      });
      mockedAxiosInstanceManager.getAxiosInstance.mockReturnValue(mockInstance);

      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      await customInstance(config, { appName: 'testApp' });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '/_api/v3',
        }),
      );
    });
  });

  describe('Configuration merging', () => {
    it('should correctly merge config and options', async () => {
      // Arrange
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: '/pages',
        data: { title: 'Test Page', body: 'Content' },
      };
      const options: AxiosRequestConfig = {
        headers: { 'X-API-Version': 'v3' },
        timeout: 10000,
      };

      // Act
      await customInstance(config, { appName: 'testApp', axiosOptions: options });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/pages',
          data: { title: 'Test Page', body: 'Content' },
          headers: { 'X-API-Version': 'v3' },
          timeout: 10000,
          baseURL: 'http://localhost/_api/v3',
          cancelToken: 'mock-cancel-token',
        }),
      );
    });

    it('should override config values with options values', async () => {
      // Arrange
      const config: AxiosRequestConfig = {
        method: 'GET',
        timeout: 1000,
        headers: { 'Content-Type': 'application/json' },
      };
      const options: AxiosRequestConfig = {
        timeout: 5000,
        headers: { 'Content-Type': 'application/xml' },
      };

      // Act
      await customInstance(config, { appName: 'testApp', axiosOptions: options });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
          headers: { 'Content-Type': 'application/xml' },
        }),
      );
    });
  });

  describe('Response processing', () => {
    it('should return the data property from response', async () => {
      // Arrange
      const expectedData = {
        pages: [
          { id: '1', title: 'Page 1', body: 'Content 1' },
          { id: '2', title: 'Page 2', body: 'Content 2' },
        ],
      };
      mockAxiosInstance.mockResolvedValue({
        data: expectedData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<{
        pages: Array<{ id: string; title: string; body: string }>;
      }>);

      const config: AxiosRequestConfig = { method: 'GET', url: '/pages' };

      // Act
      const result = await customInstance(config, { appName: 'testApp' });

      // Assert
      expect(result).toEqual(expectedData);
    });

    it('should handle empty response data correctly', async () => {
      // Arrange
      const expectedData = null;
      mockAxiosInstance.mockResolvedValue({
        data: expectedData,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {},
      } as AxiosResponse<null>);

      const config: AxiosRequestConfig = { method: 'DELETE', url: '/pages/1' };

      // Act
      const result = await customInstance(config, { appName: 'testApp' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Cancellation functionality', () => {
    it('should add cancel function to returned Promise', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      const promise = customInstance(config, { appName: 'testApp' }) as CancellablePromise<unknown>;

      // Assert
      expect(promise).toHaveProperty('cancel');
      expect(typeof promise.cancel).toBe('function');

      // cleanup
      await promise;
    });

    it('should call CancelTokenSource cancel when cancel function is invoked', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      const promise = customInstance(config, { appName: 'testApp' }) as CancellablePromise<unknown>;
      promise.cancel();

      // Assert
      expect(mockCancelTokenSource.cancel).toHaveBeenCalledWith('Query cancelled');

      // cleanup
      await promise;
    });

    it('should allow cancellation during request execution', async () => {
      // Arrange
      let resolveRequest: (value: AxiosResponse<unknown>) => void = () => {};
      const requestPromise = new Promise<AxiosResponse<unknown>>((resolve) => {
        resolveRequest = resolve;
      });

      mockAxiosInstance.mockImplementation(() => requestPromise);

      const config: AxiosRequestConfig = { method: 'GET', url: '/long-request' };

      // Act
      const promise = customInstance(config, { appName: 'testApp' }) as CancellablePromise<unknown>;
      promise.cancel();

      // Assert
      expect(mockCancelTokenSource.cancel).toHaveBeenCalledWith('Query cancelled');

      // cleanup
      if (resolveRequest) {
        resolveRequest({ data: 'test' } as AxiosResponse<unknown>);
      }
      await promise;
    });
  });

  describe('Error handling', () => {
    it('should reject Promise when Axios error occurs', async () => {
      // Arrange
      const error = new Error('API v3 endpoint not found');
      mockAxiosInstance.mockRejectedValue(error);

      const config: AxiosRequestConfig = { method: 'GET', url: '/invalid' };

      // Act & Assert
      await expect(customInstance(config, { appName: 'testApp' })).rejects.toThrow('API v3 endpoint not found');
    });

    it('should handle network errors appropriately', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockAxiosInstance.mockRejectedValue(networkError);

      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act & Assert
      await expect(customInstance(config, { appName: 'testApp' })).rejects.toThrow('Network Error');
    });

    it('should throw error when appName is not provided', () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act & Assert
      expect(() => customInstance(config)).toThrow('appName is required');
    });
  });

  describe('Type safety', () => {
    it('should apply generic types correctly', async () => {
      // Arrange
      interface User {
        id: string;
        name: string;
        email: string;
      }

      const expectedUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockAxiosInstance.mockResolvedValue({
        data: expectedUser,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<User>);

      const config: AxiosRequestConfig = { method: 'GET', url: '/user/1' };

      // Act
      const result = await customInstance<User>(config, { appName: 'testApp' });

      // Assert
      expect(result).toEqual(expectedUser);
      // TypeScript type checking ensures result is treated as User type
      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });
  });
});
