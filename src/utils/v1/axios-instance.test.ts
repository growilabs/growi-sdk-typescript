import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Axios from 'axios';
/**
 * Tests for v1/axios-instance.ts
 *
 * This file provides custom Axios instance creation functionality for GROWI API v1,
 * including automatic base URL configuration, cancellation capability, and request configuration merging.
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

describe('v1 customInstance', () => {
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
    it('should append _api suffix to default base URL', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act
      await customInstance(config, { appName: 'testApp' });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost/_api',
          cancelToken: 'mock-cancel-token',
        }),
      );
    });

    it('should prioritize baseURL specified in options', async () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };
      const options: AxiosRequestConfig = { baseURL: 'https://custom.example.com' };

      // Act
      await customInstance(config, { appName: 'testApp', axiosOptions: options });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://custom.example.com/_api',
        }),
      );
    });

    it('should use baseURL specified in config when provided', async () => {
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
          baseURL: 'https://config.example.com/_api',
        }),
      );
    });
  });

  describe('Configuration merging', () => {
    it('should correctly merge config and options', async () => {
      // Arrange
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: '/test',
        data: { name: 'test' },
      };
      const options: AxiosRequestConfig = {
        headers: { 'Custom-Header': 'value' },
        timeout: 5000,
      };

      // Act
      await customInstance(config, { appName: 'testApp', axiosOptions: options });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data: { name: 'test' },
          headers: { 'Custom-Header': 'value' },
          timeout: 5000,
          baseURL: 'http://localhost/_api',
          cancelToken: 'mock-cancel-token',
        }),
      );
    });

    it('should override config values with options values', async () => {
      // Arrange
      const config: AxiosRequestConfig = {
        method: 'GET',
        timeout: 1000,
      };
      const options: AxiosRequestConfig = {
        timeout: 3000,
      };

      // Act
      await customInstance(config, { appName: 'testApp', axiosOptions: options });

      // Assert
      expect(mockAxiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 3000,
        }),
      );
    });
  });

  describe('Response processing', () => {
    it('should return the data property from response', async () => {
      // Arrange
      const expectedData = { users: [{ id: 1, name: 'John' }] };
      mockAxiosInstance.mockResolvedValue({
        data: expectedData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<{ users: Array<{ id: number; name: string }> }>);

      const config: AxiosRequestConfig = { method: 'GET', url: '/users' };

      // Act
      const result = await customInstance(config, { appName: 'testApp' });

      // Assert
      expect(result).toEqual(expectedData);
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
  });

  describe('Error handling', () => {
    it('should reject Promise when Axios error occurs', async () => {
      // Arrange
      const error = new Error('Network error');
      mockAxiosInstance.mockRejectedValue(error);

      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act & Assert
      await expect(customInstance(config, { appName: 'testApp' })).rejects.toThrow('Network error');
    });

    it('should throw error when appName is not provided', () => {
      // Arrange
      const config: AxiosRequestConfig = { method: 'GET', url: '/test' };

      // Act & Assert
      expect(() => customInstance(config)).toThrow('appName is required');
    });
  });
});
