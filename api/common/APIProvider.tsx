import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { storage } from '@utils/mmkvStore';
import { registerAxiosIntercepts, setAuthHeaders } from './axios';

// Register axios interceptors and set headers at startup
registerAxiosIntercepts();
setAuthHeaders();

interface ClientStorage {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
}

// Create a custom storage interface for MMKV
const clientStorage: ClientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

// Create the persister with optimized settings
const persister = createSyncStoragePersister({
  storage: clientStorage,
  key: 'REACT_QUERY_CACHE',
  throttleTime: 2000, // Increase throttle time to reduce writes
  serialize: data => JSON.stringify(data),
  deserialize: data => JSON.parse(data),
});

// Create QueryClient with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

interface APIProviderProps {
  children: React.ReactNode;
}

export const APIProvider: React.FC<APIProviderProps> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: process.env.APP_VERSION || '1.0.0',
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
