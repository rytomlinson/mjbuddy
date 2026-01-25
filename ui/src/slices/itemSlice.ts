import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Item } from 'common';
import type { RootState } from '../store';

interface ItemState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: ItemState = {
  items: [],
  loading: false,
  error: null,
};

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addItem: (state, action: PayloadAction<Item>) => {
      state.items.unshift(action.payload);
    },
    updateItem: (state, action: PayloadAction<Item>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

// Actions
export const { setLoading, setError, setItems, addItem, updateItem, removeItem } =
  itemSlice.actions;

// Selectors
export const selectItems = (state: RootState) => state.items.items;
export const selectItemsLoading = (state: RootState) => state.items.loading;
export const selectItemsError = (state: RootState) => state.items.error;
export const selectItemById = (id: number) => (state: RootState) =>
  state.items.items.find((item) => item.id === id);

// Reducer
export const itemReducer = itemSlice.reducer;
