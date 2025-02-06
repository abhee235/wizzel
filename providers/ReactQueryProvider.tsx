// components/ReactQueryProvider.js
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  // Create a client with useState to ensure it is not re-created on every render
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
