import { useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'react-jss';
import { store } from './store';
import { trpc, createTrpcClient } from './trpc';
import { theme } from './theme';
import { ItemList } from './components';

function AppContent() {
  return <ItemList />;
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <AppContent />
          </ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
