import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import Axios from 'axios';
/**
 * Tests for v3/axios-instance.ts
 *
 * This file provides custom Axios instance creation functionality for GROWI API v3,
 * including automatic base URL configuration (with v3 suffix), cancellation capability, and request configuration merging.
 */
import { type MockedFunction, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AXIOS_DEFAULT } from '../axios-default-instance.js';
import { customInstance } from './axios-instance.js';

// Mock Axios
vi.mock('axios');
vi.mock('../axios-default-instance.js');

const mockedAxios = vi.mocked(Axios);
const mockedAXIOS_DEFAULT = vi.mocked(AXIOS_DEFAULT);

describe('v3 customInstance', () => {
  let mockCancelTokenSource: {
    token: string;
    cancel: MockedFunction<any>;
  };
  let mockAxiosInstance: MockedFunction<any>;

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
    } as any;

    // Mock for Axios instance
    mockAxiosInstance = vi.fn().mockResolvedValue({
      data: { result: 'success' },
    } as AxiosResponse);

    // Mock for AXIOS_DEFAULT
    mockedAXIOS_DEFAULT.instance = mockAxiosInstance;
    mockedAXIOS_DEFAULT.instance.defaults = {
      baseURL: 'http://localhost',
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Base URL configuration', () => {
    it('should append _api/v3 suffix to default base URL', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      await customInstance(config);

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
      await customInstance(config, options);

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
      await customInstance(config);

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://config.example.com/_api/v3',
        }),
      );
    });

    it('should set only _api/v3 when baseURL is empty string', async () => {
      // Arrange
      mockedAXIOS_DEFAULT.instance.defaults.baseURL = '';
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      await customInstance(config);

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
      await customInstance(config, options);

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
      await customInstance(config, options);

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
      } as AxiosResponse);

      const config: AxiosRequestConfig = { method: 'GET', url: '/pages' };

      // Act
      const result = await customInstance(config);

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
      } as AxiosResponse);

      const config: AxiosRequestConfig = { method: 'DELETE', url: '/pages/1' };

      // Act
      const result = await customInstance(config);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Cancellation functionality', () => {
    it('should add cancel function to returned Promise', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      const promise = customInstance(config);

      // Assert
      expect(promise).toHaveProperty('cancel');
      expect(typeof (promise as any).cancel).toBe('function');

      // cleanup
      await promise;
    });

    it('should call CancelTokenSource cancel when cancel function is invoked', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      const promise = customInstance(config);
      (promise as any).cancel();

      // Assert
      expect(mockCancelTokenSource.cancel).toHaveBeenCalledWith('Query cancelled');

      // cleanup
      await promise;
    });

    it('should allow cancellation during request execution', async () => {
      // Arrange
      let resolveRequest: (value: any) => void = () => {};
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });

      mockAxiosInstance.mockImplementation(() => requestPromise);

      const config: AxiosRequestConfig = { method: 'GET', url: '/long-request' };

      // Act
      const promise = customInstance(config);
      (promise as any).cancel();

      // Assert
      expect(mockCancelTokenSource.cancel).toHaveBeenCalledWith('Query cancelled');

      // cleanup
      if (resolveRequest) {
        resolveRequest({ data: 'test' });
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
      await expect(customInstance(config)).rejects.toThrow('API v3 endpoint not found');
    });

    it('should handle network errors appropriately', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockAxiosInstance.mockRejectedValue(networkError);

      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act & Assert
      await expect(customInstance(config)).rejects.toThrow('Network Error');
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
      } as AxiosResponse);

      const config: AxiosRequestConfig = { method: 'GET', url: '/user/1' };

      // Act
      const result = await customInstance<User>(config);

      // Assert
      expect(result).toEqual(expectedUser);
      // TypeScript type checking ensures result is treated as User type
      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });
  });
});
