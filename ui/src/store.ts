import { configureStore } from '@reduxjs/toolkit';
import { itemReducer } from './slices/itemSlice';

export const store = configureStore({
  reducer: {
    items: itemReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore date serialization warnings
        ignoredActions: ['items/setItems', 'items/addItem', 'items/updateItem'],
        ignoredPaths: ['items.items'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
