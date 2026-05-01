// Axios instance with Clerk session token injected on every request
import axios from 'axios';
import { useAuth } from '@clerk/expo';
import { useCallback } from 'react';

const BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({ baseURL: BASE_URL });

/**
 * Returns an axios instance that attaches the current Clerk token as a Bearer header.
 * Must be called inside a React component so useAuth() has context.
 */
export const useApiClient = () => {
  const { getToken } = useAuth();

  const authRequest = useCallback(
    async (config) => {
      const token = await getToken();
      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      }
      return apiClient(config);
    },
    [getToken]
  );

  return { authRequest, client: apiClient };
};

export default apiClient;
