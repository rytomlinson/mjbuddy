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
const MAX_TOTAL_TILES = 14; // Max including drawn tile

// Helper to calculate total tiles
function getTotalTiles(state: HandState): number {
  const handCount = state.tiles.length;
  const drawnCount = state.drawnTile !== null ? 1 : 0;
  const meldCount = state.exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
  return handCount + drawnCount + meldCount;
}

const handSlice = createSlice({
  name: 'hand',
  initialState,
  reducers: {
    addTile: (state, action: PayloadAction<TileCode>) => {
      const exposedCount = state.exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
      const maxConcealed = MAX_HAND_SIZE - exposedCount;
      if (state.tiles.length < maxConcealed && getTotalTiles(state) < MAX_TOTAL_TILES) {
        state.tiles.push(action.payload);
      }
    },
    insertTileAt: (state, action: PayloadAction<{ tile: TileCode; index: number }>) => {
      const { tile, index } = action.payload;
      const exposedCount = state.exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
      const maxConcealed = MAX_HAND_SIZE - exposedCount;
      if (state.tiles.length < maxConcealed && getTotalTiles(state) < MAX_TOTAL_TILES && index >= 0 && index <= state.tiles.length) {
        state.tiles.splice(index, 0, tile);
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
      const exposedCount = state.exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
      const maxConcealed = MAX_HAND_SIZE - exposedCount;
      state.tiles = action.payload.slice(0, maxConcealed);
    },
    clearTiles: (state) => {
      state.tiles = [];
    },
    setDrawnTile: (state, action: PayloadAction<TileCode | null>) => {
      // Only set drawn tile if we won't exceed max (or if clearing it)
      if (action.payload === null || getTotalTiles(state) < MAX_TOTAL_TILES) {
        state.drawnTile = action.payload;
      }
    },
    addDrawnToHand: (state) => {
      const exposedCount = state.exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
      const maxConcealed = MAX_HAND_SIZE - exposedCount;
      if (state.drawnTile !== null && state.tiles.length < maxConcealed) {
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
    reorderTile: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex >= 0 &&
        fromIndex < state.tiles.length &&
        toIndex >= 0 &&
        toIndex < state.tiles.length &&
        fromIndex !== toIndex
      ) {
        // Remove tile from original position
        const [tile] = state.tiles.splice(fromIndex, 1);
        // Insert at new position
        state.tiles.splice(toIndex, 0, tile);
      }
    },
    swapJokerInMeld: (state, action: PayloadAction<{ meldIndex: number; tileIndex: number; naturalTile: TileCode }>) => {
      const { meldIndex, tileIndex, naturalTile } = action.payload;
      if (meldIndex >= 0 && meldIndex < state.exposedMelds.length) {
        const meld = state.exposedMelds[meldIndex];
        if (tileIndex >= 0 && tileIndex < meld.tiles.length) {
          // Replace joker with natural tile in meld
          meld.tiles[tileIndex] = naturalTile;
          // Decrement joker count
          if (meld.jokerCount > 0) {
            meld.jokerCount--;
          }
        }
      }
    },
    loadSavedHand: (state, action: PayloadAction<{ tiles: TileCode[]; drawnTile: TileCode | null; exposedMelds: ExposedMeld[] }>) => {
      const { tiles, drawnTile, exposedMelds } = action.payload;
      state.tiles = tiles;
      state.drawnTile = drawnTile;
      state.exposedMelds = exposedMelds;
    },
  },
});

// Actions
export const {
  addTile,
  insertTileAt,
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
  reorderTile,
  swapJokerInMeld,
  loadSavedHand,
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
