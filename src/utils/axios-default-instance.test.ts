import type { AxiosInstance } from 'axios';
/**
 * Tests for axios-default-instance.ts
 *
 * This file manages the default Axios instance for GROWI SDK,
 * providing functionality to configure base URL and authentication headers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AXIOS_DEFAULT } from './axios-default-instance.js';

describe('AXIOS_DEFAULT', () => {
  beforeEach(() => {
    // Reset the instance before each test
    AXIOS_DEFAULT.instance.defaults.baseURL = 'http://localhost';
    AXIOS_DEFAULT.instance.defaults.headers.common.Authorization = undefined;
  });

  describe('setBaseURL', () => {
    it('should update base URL when setting a valid URL', () => {
      // Arrange
      const newBaseURL = 'https://api.example.com';

      // Act
      AXIOS_DEFAULT.setBaseURL(newBaseURL);

      // Assert
      expect(AXIOS_DEFAULT.instance.defaults.baseURL).toBe(newBaseURL);
    });

    it('should set base URL to empty string when empty string is provided', () => {
      // Arrange
      const emptyURL = '';

      // Act
      AXIOS_DEFAULT.setBaseURL(emptyURL);

      // Assert
      expect(AXIOS_DEFAULT.instance.defaults.baseURL).toBe(emptyURL);
    });

    it('should use the last value when called multiple times', () => {
      // Arrange
      const firstURL = 'https://first.example.com';
      const secondURL = 'https://second.example.com';

      // Act
      AXIOS_DEFAULT.setBaseURL(firstURL);
      AXIOS_DEFAULT.setBaseURL(secondURL);

      // Assert
      expect(AXIOS_DEFAULT.instance.defaults.baseURL).toBe(secondURL);
    });
  });

  describe('setAuthorizationHeader', () => {
    it('should set authorization header in Bearer token format when valid token is provided', () => {
      // Arrange
      const token = 'test-token-123';
      const expectedHeader = `Bearer ${token}`;

      // Act
      AXIOS_DEFAULT.setAuthorizationHeader(token);

      // Assert
      expect(AXIOS_DEFAULT.instance.defaults.headers.common.Authorization).toBe(expectedHeader);
    });

    it('should set Bearer header with empty string when empty token is provided', () => {
      // Arrange
      const emptyToken = '';
      const expectedHeader = 'Bearer ';

      // Act
      AXIOS_DEFAULT.setAuthorizationHeader(emptyToken);

      // Assert
      expect(AXIOS_DEFAULT.instance.defaults.headers.common.Authorization).toBe(expectedHeader);
    });

    it('should use the last token when called multiple times', () => {
      // Arrange
      const firstToken = 'first-token';
      const secondToken = 'second-token';
      const expectedHeader = `Bearer ${secondToken}`;

      // Act
      AXIOS_DEFAULT.setAuthorizationHeader(firstToken);
      AXIOS_DEFAULT.setAuthorizationHeader(secondToken);

      // Assert
      expect(AXIOS_DEFAULT.instance.defaults.headers.common.Authorization).toBe(expectedHeader);
    });
  });

  describe('instance', () => {
    it('should have default base URL set to localhost', () => {
      // Assert
      expect(AXIOS_DEFAULT.instance.defaults.baseURL).toBe('http://localhost');
    });

    it('should have Axios instance properly created', () => {
      // Assert
      expect(AXIOS_DEFAULT.instance).toBeDefined();
      expect(typeof AXIOS_DEFAULT.instance).toBe('function');
      expect(AXIOS_DEFAULT.instance.defaults).toBeDefined();
    });
  });
});
