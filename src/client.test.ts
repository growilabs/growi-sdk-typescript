/**
 * Tests for client.ts
 *
 * This file manages the GrowiClient class,
 * providing functionality to create GROWI API clients with custom axios instances.
 */
import { describe, expect, it, vi } from 'vitest';
import { GrowiClient } from './client.js';

// Mock the generated API modules
vi.mock('./generated/v1/index.js', () => ({
  getGrowirestapiv1: vi.fn(() => ({ mockV1Api: true })),
}));

vi.mock('./generated/v3/index.js', () => ({
  getGrowirestapiv3: vi.fn(() => ({ mockV3Api: true })),
}));

describe('GrowiClient', () => {
  describe('constructor', () => {
    it('should create a GrowiClient instance with valid config', () => {
      // Arrange
      const config = {
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };

      // Act
      const client = new GrowiClient(config);

      // Assert
      expect(client).toBeInstanceOf(GrowiClient);
      expect(client.v1).toBeDefined();
      expect(client.v3).toBeDefined();
    });

    it('should set base URL from config', () => {
      // Arrange
      const config = {
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };

      // Act
      const client = new GrowiClient(config);
      const axiosInstance = client.getAxiosInstance();

      // Assert
      expect(axiosInstance.defaults.baseURL).toBe(config.baseURL);
    });

    it('should set authorization header in Bearer token format', () => {
      // Arrange
      const config = {
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };

      // Act
      const client = new GrowiClient(config);
      const axiosInstance = client.getAxiosInstance();

      // Assert
      expect(axiosInstance.defaults.headers.common.Authorization).toBe(`Bearer ${config.token}`);
    });

    it('should create different axios instances for different clients', () => {
      // Arrange
      const config1 = {
        baseURL: 'https://api1.example.com',
        token: 'test-token-123',
      };
      const config2 = {
        baseURL: 'https://api2.example.com',
        token: 'test-token-123',
      };

      // Act
      const client1 = new GrowiClient(config1);
      const client2 = new GrowiClient(config2);

      // Assert
      expect(client1.getAxiosInstance()).not.toBe(client2.getAxiosInstance());
      expect(client1.getAxiosInstance().defaults.baseURL).toBe(config1.baseURL);
      expect(client2.getAxiosInstance().defaults.baseURL).toBe(config2.baseURL);
    });

    it('should handle empty string values correctly', () => {
      // Arrange
      const configWithEmptyValues = {
        baseURL: '',
        token: '',
      };

      // Act
      const client = new GrowiClient(configWithEmptyValues);
      const axiosInstance = client.getAxiosInstance();

      // Assert
      expect(axiosInstance.defaults.baseURL).toBe('');
      expect(axiosInstance.defaults.headers.common.Authorization).toBe('Bearer ');
    });
  });

  describe('getAxiosInstance', () => {
    it('should return the internal axios instance', () => {
      // Arrange
      const config = {
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };
      const client = new GrowiClient(config);

      // Act
      const axiosInstance = client.getAxiosInstance();

      // Assert
      expect(axiosInstance).toBeDefined();
      expect(typeof axiosInstance).toBe('function');
      expect(axiosInstance.defaults).toBeDefined();
    });

    it('should return the same instance when called multiple times', () => {
      // Arrange
      const config = {
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };
      const client = new GrowiClient(config);

      // Act
      const instance1 = client.getAxiosInstance();
      const instance2 = client.getAxiosInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });
  });

  describe('API instances', () => {
    it('should have v1 API instance available', () => {
      // Arrange
      const config = {
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };
      const client = new GrowiClient(config);

      // Assert
      expect(client.v1).toBeDefined();
      expect(client.v1).toEqual({ mockV1Api: true });
    });

    it('should have v3 API instance available', () => {
      // Arrange
      const config = {
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      };
      const client = new GrowiClient(config);

      // Assert
      expect(client.v3).toBeDefined();
      expect(client.v3).toEqual({ mockV3Api: true });
    });
  });
});
