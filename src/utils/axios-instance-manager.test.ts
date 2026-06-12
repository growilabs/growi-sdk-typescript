import type { AxiosInstance } from 'axios';
import { describe, expect, it } from 'vitest';
import { axiosInstanceManager } from './axios-instance-manager.js';

type CapturedHeaders = {
  authorization: unknown;
  hasGrowiAccessToken: boolean;
  growiAccessToken: unknown;
};

/**
 * Fire a request through the instance and capture the fully-merged outgoing headers via a request interceptor,
 * rejecting before any network call. This asserts what GROWI would actually receive, rather than poking the
 * instance's internal `defaults`, so the test stays meaningful even if the header wiring changes.
 */
const captureRequestHeaders = async (instance: AxiosInstance): Promise<CapturedHeaders> => {
  const marker = '__captured__';
  let captured: CapturedHeaders = { authorization: undefined, hasGrowiAccessToken: false, growiAccessToken: undefined };

  const interceptorId = instance.interceptors.request.use((config) => {
    const headers = config.headers;
    captured = {
      authorization: headers.get('Authorization'),
      hasGrowiAccessToken: headers.has('X-GROWI-ACCESS-TOKEN'),
      growiAccessToken: headers.get('X-GROWI-ACCESS-TOKEN'),
    };
    return Promise.reject(new Error(marker));
  });

  try {
    await instance.get('/probe');
  } catch (error) {
    if (!(error instanceof Error) || error.message !== marker) throw error;
  } finally {
    instance.interceptors.request.eject(interceptorId);
  }

  return captured;
};

describe('AxiosInstanceManager', () => {
  describe('addAxiosInstance', () => {
    it('sends a Bearer Authorization header and no GROWI access token by default', async () => {
      axiosInstanceManager.addAxiosInstance({
        appName: 'bearer-app',
        baseURL: 'https://api.example.com',
        token: 'test-token-123',
      });

      const headers = await captureRequestHeaders(axiosInstanceManager.getAxiosInstance('bearer-app'));

      expect(headers.authorization).toBe('Bearer test-token-123');
      expect(headers.hasGrowiAccessToken).toBe(false);
    });

    it('sends the custom Authorization header and the token via X-GROWI-ACCESS-TOKEN when authorizationHeader is provided', async () => {
      axiosInstanceManager.addAxiosInstance({
        appName: 'custom-auth-app',
        baseURL: 'https://api.example.com',
        token: 'growi-token-456',
        authorizationHeader: 'Custom custom-auth-value',
      });

      const headers = await captureRequestHeaders(axiosInstanceManager.getAxiosInstance('custom-auth-app'));

      expect(headers.authorization).toBe('Custom custom-auth-value');
      expect(headers.growiAccessToken).toBe('growi-token-456');
    });

    it('applies the configured baseURL to the instance', () => {
      axiosInstanceManager.addAxiosInstance({
        appName: 'baseurl-app',
        baseURL: 'https://api.example.com',
        token: 'test-token',
      });

      expect(axiosInstanceManager.getAxiosInstance('baseurl-app').defaults.baseURL).toBe('https://api.example.com');
    });

    it('keeps instances isolated so each carries its own credentials', async () => {
      axiosInstanceManager.addAxiosInstance({
        appName: 'multi-1',
        baseURL: 'https://api1.example.com',
        token: 'token1',
      });
      axiosInstanceManager.addAxiosInstance({
        appName: 'multi-2',
        baseURL: 'https://api2.example.com',
        token: 'token2',
        authorizationHeader: 'Bearer custom-token',
      });

      const headers1 = await captureRequestHeaders(axiosInstanceManager.getAxiosInstance('multi-1'));
      const headers2 = await captureRequestHeaders(axiosInstanceManager.getAxiosInstance('multi-2'));

      expect(headers1.authorization).toBe('Bearer token1');
      expect(headers1.hasGrowiAccessToken).toBe(false);
      expect(headers2.authorization).toBe('Bearer custom-token');
      expect(headers2.growiAccessToken).toBe('token2');
    });

    it('overwrites the existing instance when the same appName is reused', async () => {
      axiosInstanceManager.addAxiosInstance({
        appName: 'overwrite-app',
        baseURL: 'https://api.example.com',
        token: 'original-token',
      });
      axiosInstanceManager.addAxiosInstance({
        appName: 'overwrite-app',
        baseURL: 'https://api-updated.example.com',
        token: 'updated-token',
        authorizationHeader: 'Bearer updated-auth',
      });

      const instance = axiosInstanceManager.getAxiosInstance('overwrite-app');
      const headers = await captureRequestHeaders(instance);

      expect(instance.defaults.baseURL).toBe('https://api-updated.example.com');
      expect(headers.authorization).toBe('Bearer updated-auth');
      expect(headers.growiAccessToken).toBe('updated-token');
    });

    it('throws when appName is an empty string', () => {
      expect(() => {
        axiosInstanceManager.addAxiosInstance({ appName: '', baseURL: 'https://api.example.com', token: 'token' });
      }).toThrow('appName must be a non-empty string');
    });

    it('throws when baseURL is an empty string', () => {
      expect(() => {
        axiosInstanceManager.addAxiosInstance({ appName: 'app-name', baseURL: '', token: 'token' });
      }).toThrow('baseURL must be a non-empty string');
    });

    it('throws when token is an empty string', () => {
      expect(() => {
        axiosInstanceManager.addAxiosInstance({ appName: 'app-name', baseURL: 'https://api.example.com', token: '' });
      }).toThrow('token must be a non-empty string');
    });
  });

  describe('getAxiosInstance', () => {
    it('returns the same instance for a given appName', () => {
      axiosInstanceManager.addAxiosInstance({
        appName: 'stable-app',
        baseURL: 'https://api.example.com',
        token: 'test-token',
      });

      expect(axiosInstanceManager.getAxiosInstance('stable-app')).toBe(axiosInstanceManager.getAxiosInstance('stable-app'));
    });

    it('returns different instances for different appNames', () => {
      axiosInstanceManager.addAxiosInstance({
        appName: 'distinct-1',
        baseURL: 'https://api1.example.com',
        token: 'token1',
      });
      axiosInstanceManager.addAxiosInstance({
        appName: 'distinct-2',
        baseURL: 'https://api2.example.com',
        token: 'token2',
      });

      expect(axiosInstanceManager.getAxiosInstance('distinct-1')).not.toBe(axiosInstanceManager.getAxiosInstance('distinct-2'));
    });

    it('throws for a non-existent appName', () => {
      expect(() => {
        axiosInstanceManager.getAxiosInstance('non-existent-app');
      }).toThrow('No Axios instance found for appName: non-existent-app');
    });
  });
});
