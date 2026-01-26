import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TileCode } from 'common';
import type { RootState } from '../store';

export interface ExposedMeld {
  type: 'pung' | 'kong' | 'quint' | 'sextet';
  tiles: TileCode[];
  jokerCount: number;
}

interface HandState {
  tiles: TileCode[];
  drawnTile: TileCode | null;
  exposedMelds: ExposedMeld[];
}

const initialState: HandState = {
  tiles: [],
  drawnTile: null,
  exposedMelds: [],
};

const MAX_HAND_SIZE = 13;

const handSlice = createSlice({
  name: 'hand',
  initialState,
  reducers: {
    addTile: (state, action: PayloadAction<TileCode>) => {
      if (state.tiles.length < MAX_HAND_SIZE) {
        state.tiles.push(action.payload);
      }
    },
    removeTile: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.tiles.length) {
        state.tiles.splice(action.payload, 1);
      }
    },
    removeTileByCode: (state, action: PayloadAction<TileCode>) => {
      const index = state.tiles.indexOf(action.payload);
      if (index !== -1) {
        state.tiles.splice(index, 1);
      }
    },
    setTiles: (state, action: PayloadAction<TileCode[]>) => {
      state.tiles = action.payload.slice(0, MAX_HAND_SIZE);
    },
    clearTiles: (state) => {
      state.tiles = [];
    },
    setDrawnTile: (state, action: PayloadAction<TileCode | null>) => {
      state.drawnTile = action.payload;
    },
    addDrawnToHand: (state) => {
      if (state.drawnTile !== null && state.tiles.length < MAX_HAND_SIZE) {
        state.tiles.push(state.drawnTile);
        state.drawnTile = null;
      }
    },
    discardDrawn: (state) => {
      state.drawnTile = null;
    },
    addExposedMeld: (state, action: PayloadAction<ExposedMeld>) => {
      state.exposedMelds.push(action.payload);
    },
    removeExposedMeld: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.exposedMelds.length) {
        state.exposedMelds.splice(action.payload, 1);
      }
    },
    clearExposedMelds: (state) => {
      state.exposedMelds = [];
    },
    resetHand: (state) => {
      state.tiles = [];
      state.drawnTile = null;
      state.exposedMelds = [];
    },
  },
});

// Actions
export const {
  addTile,
  removeTile,
  removeTileByCode,
  setTiles,
  clearTiles,
  setDrawnTile,
  addDrawnToHand,
  discardDrawn,
  addExposedMeld,
  removeExposedMeld,
  clearExposedMelds,
  resetHand,
} = handSlice.actions;

// Selectors
export const selectHandTiles = (state: RootState) => state.hand.tiles;
export const selectDrawnTile = (state: RootState) => state.hand.drawnTile;
export const selectExposedMelds = (state: RootState) => state.hand.exposedMelds;
export const selectHandSize = (state: RootState) => state.hand.tiles.length;
export const selectIsHandFull = (state: RootState) => state.hand.tiles.length >= MAX_HAND_SIZE;
export const selectTotalTileCount = (state: RootState) => {
  const handCount = state.hand.tiles.length;
  const drawnCount = state.hand.drawnTile !== null ? 1 : 0;
  const meldCount = state.hand.exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
  return handCount + drawnCount + meldCount;
};

// Reducer
export const handReducer = handSlice.reducer;
