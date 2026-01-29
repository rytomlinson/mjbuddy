/**
 * Seed script for NMJL 2025 card
 * Run with: npx tsx src/seed2025Special.ts
 *
 * NOTE: The complete NMJL card data is copyrighted by the National Mah Jongg League, Inc.
 * This file contains patterns gathered from publicly available clarification documents.
 * For the complete official card, please purchase from the NMJL.
 */

import { initDb, query, closeDb } from './db.js';
import { TileType, GroupType } from 'common';
import type { PatternGroup, TilePattern } from 'common';

// Dragon values: RED=1, GREEN=2, WHITE=3
const RED = 1, GREEN = 2, WHITE = 3;
// Wind values: EAST=1, SOUTH=2, WEST=3, NORTH=4
const EAST = 1, SOUTH = 2, WEST = 3, NORTH = 4;

// Group helpers
function single(tile: TilePattern): PatternGroup {
  return { type: GroupType.SINGLE, tile };
}

function pair(tile: TilePattern): PatternGroup {
  return { type: GroupType.PAIR, tile };
}

function pung(tile: TilePattern): PatternGroup {
  return { type: GroupType.PUNG, tile };
}

function kong(tile: TilePattern): PatternGroup {
  return { type: GroupType.KONG, tile };
}

function quint(tile: TilePattern): PatternGroup {
  return { type: GroupType.QUINT, tile };
}

function sextet(tile: TilePattern): PatternGroup {
  return { type: GroupType.SEXTET, tile };
}

interface HandData {
  displayName: string;
  displayPattern: string;
  patternGroups: PatternGroup[];
  isConcealed: boolean;
  points: number;
  notes: string | null;
}

// Categories with their hands
const categories: { name: string; hands: HandData[] }[] = [
  {
    name: '2025',
    hands: [
      {
        displayName: '2025 #1',
        displayPattern: 'FFFF 2025 222 222',
        patternGroups: [
          kong({ isAnyFlower: true }),
          single({ suitVar: 'A', constraints: { specificValues: [2] } }),
          single({ isZero: true }),
          single({ suitVar: 'A', constraints: { specificValues: [2] } }),
          single({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pung({ suitVar: 'B', constraints: { specificValues: [2] } }),
          pung({ suitVar: 'B', constraints: { specificValues: [2] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 2 Suits',
      },
      {
        displayName: '2025 #2',
        displayPattern: '222 0000 222 5555',
        patternGroups: [
          pung({ suitVar: 'A', constraints: { specificValues: [2] } }),
          kong({ isZero: true }),
          pung({ suitVar: 'A', constraints: { specificValues: [2] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [5] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit, Pairs: Same Suit',
      },
      {
        displayName: '2025 #3',
        displayPattern: 'FF 222 000 222 555',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pung({ suitVar: 'A', constraints: { specificValues: [2] } }),
          pung({ isZero: true }),
          pung({ suitVar: 'B', constraints: { specificValues: [2] } }),
          pung({ suitVar: 'B', constraints: { specificValues: [5] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 2 Suits',
      },
      {
        displayName: '2025 #4',
        displayPattern: 'FF 222 000 322 SSS',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pung({ suitVar: 'A', constraints: { specificValues: [2] } }),
          pung({ isZero: true }),
          pung({ suitVar: 'A', constraints: { specificValues: [2] } }),
          pung({ fixed: (TileType.WIND << 4) | SOUTH }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
    ],
  },
  {
    name: '2468',
    hands: [
      {
        displayName: '2468 #1',
        displayPattern: '222 4444 666 8888',
        patternGroups: [
          pung({ suitVar: 'A', constraints: { specificValues: [2] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [4] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [8] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: '2468 #2',
        displayPattern: '22 4444 66 8888',
        patternGroups: [
          pair({ suitVar: 'A', constraints: { specificValues: [2] } }),
          kong({ suitVar: 'B', constraints: { specificValues: [4] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'B', constraints: { specificValues: [8] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 2 Suits',
      },
      {
        displayName: '2468 #3',
        displayPattern: '222 4444 666 DDDD',
        patternGroups: [
          pung({ suitVar: 'A', constraints: { specificValues: [2] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [4] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 30,
        notes: 'Any 1 Suit, Kong: Matching Dragon',
      },
      {
        displayName: '2468 #4',
        displayPattern: 'FFF 22 44 66 8888',
        patternGroups: [
          pung({ isAnyFlower: true }),
          pair({ suitVar: 'A', constraints: { specificValues: [2] } }),
          pair({ suitVar: 'B', constraints: { specificValues: [4] } }),
          pair({ suitVar: 'C', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [8] } }),
        ],
        isConcealed: false,
        points: 30,
        notes: 'Any 1 or 3 Suits, Pairs: Same or Diff Suit',
      },
      {
        displayName: '2468 #5',
        displayPattern: 'FF 22 44 666 8888',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pair({ suitVar: 'A', constraints: { specificValues: [2] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [4] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [8] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit, Pairs Only',
      },
      {
        displayName: '2468 #6',
        displayPattern: '22 44 666 8888 DD',
        patternGroups: [
          pair({ suitVar: 'A', constraints: { specificValues: [2] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [4] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [8] } }),
          pair({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit, Pairs: Same Suit, Dragon: Matching',
      },
    ],
  },
  {
    name: 'QUINTS',
    hands: [
      {
        displayName: 'Quints #1',
        displayPattern: 'FF 111 22222 33333',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pung({ suitVar: 'A', constraints: { specificValues: [1] } }),
          quint({ suitVar: 'A', constraints: { specificValues: [2] } }),
          quint({ suitVar: 'A', constraints: { specificValues: [3] } }),
        ],
        isConcealed: false,
        points: 35,
        notes: 'Any 3 Consecutive Numbers',
      },
      {
        displayName: 'Quints #2',
        displayPattern: 'FF 11111 1111 11',
        patternGroups: [
          pair({ isAnyFlower: true }),
          quint({ suitVar: 'A', numberVar: 'X' }),
          kong({ suitVar: 'B', numberVar: 'X' }),
          pair({ suitVar: 'C', numberVar: 'X' }),
        ],
        isConcealed: false,
        points: 40,
        notes: 'Any Like Numbers, 3 Suits',
      },
      {
        displayName: 'Quints #3',
        displayPattern: '11 22 33 666 77777',
        patternGroups: [
          pair({ suitVar: 'A', numberVar: 'X' }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 1 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          pung({ suitVar: 'B', constraints: { specificValues: [6] } }),
          quint({ suitVar: 'B', constraints: { specificValues: [7] } }),
        ],
        isConcealed: false,
        points: 50,
        notes: 'Pairs: Any 3 Consec Numbers, 1 Suit',
      },
      {
        displayName: 'Quints #4',
        displayPattern: '11 55 666 77777 PP',
        patternGroups: [
          pair({ suitVar: 'A', constraints: { specificValues: [1] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          quint({ suitVar: 'A', constraints: { specificValues: [7] } }),
          pair({ isAnyFlower: true }),
        ],
        isConcealed: false,
        points: 55,
        notes: 'Any 1 Suit',
      },
      {
        displayName: 'Quints #5',
        displayPattern: 'FFFFF NNNNNNNN',
        patternGroups: [
          quint({ isAnyFlower: true }),
          sextet({ fixed: (TileType.WIND << 4) | NORTH }),
          pair({ fixed: (TileType.WIND << 4) | NORTH }),
        ],
        isConcealed: false,
        points: 75,
        notes: null,
      },
    ],
  },
  {
    name: 'WINDS - DRAGONS',
    hands: [
      {
        displayName: 'Winds-Dragons #1',
        displayPattern: 'NN EE WWW SSS DDDD',
        patternGroups: [
          pair({ fixed: (TileType.WIND << 4) | NORTH }),
          pair({ fixed: (TileType.WIND << 4) | EAST }),
          pung({ fixed: (TileType.WIND << 4) | WEST }),
          pung({ fixed: (TileType.WIND << 4) | SOUTH }),
          kong({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 25,
        notes: null,
      },
      {
        displayName: 'Winds-Dragons #2',
        displayPattern: 'NNNN EEE WWW SSSS',
        patternGroups: [
          kong({ fixed: (TileType.WIND << 4) | NORTH }),
          pung({ fixed: (TileType.WIND << 4) | EAST }),
          pung({ fixed: (TileType.WIND << 4) | WEST }),
          kong({ fixed: (TileType.WIND << 4) | SOUTH }),
        ],
        isConcealed: false,
        points: 30,
        notes: null,
      },
      {
        displayName: 'Winds-Dragons #3',
        displayPattern: 'NN EE WW SS DDDD',
        patternGroups: [
          pair({ fixed: (TileType.WIND << 4) | NORTH }),
          pair({ fixed: (TileType.WIND << 4) | EAST }),
          pair({ fixed: (TileType.WIND << 4) | WEST }),
          pair({ fixed: (TileType.WIND << 4) | SOUTH }),
          kong({ isAnyDragon: true }),
        ],
        isConcealed: true,
        points: 30,
        notes: 'Concealed',
      },
      {
        displayName: 'Winds-Dragons #4',
        displayPattern: 'FFFF NNNN SSSS DD',
        patternGroups: [
          kong({ isAnyFlower: true }),
          kong({ fixed: (TileType.WIND << 4) | NORTH }),
          kong({ fixed: (TileType.WIND << 4) | SOUTH }),
          pair({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 30,
        notes: null,
      },
      {
        displayName: 'Winds-Dragons #5',
        displayPattern: 'FF DDDD DDDD DDDD',
        patternGroups: [
          pair({ isAnyFlower: true }),
          kong({ fixed: (TileType.DRAGON << 4) | RED }),
          kong({ fixed: (TileType.DRAGON << 4) | GREEN }),
          kong({ fixed: (TileType.DRAGON << 4) | WHITE }),
        ],
        isConcealed: false,
        points: 35,
        notes: null,
      },
    ],
  },
  {
    name: 'ANY LIKE NUMBERS',
    hands: [
      {
        displayName: 'Like Numbers #1',
        displayPattern: 'FF 1111 D 1111 D 11',
        patternGroups: [
          pair({ isAnyFlower: true }),
          kong({ suitVar: 'A', numberVar: 'X' }),
          single({ isAnyDragon: true }),
          kong({ suitVar: 'B', numberVar: 'X' }),
          single({ isAnyDragon: true }),
          pair({ suitVar: 'C', numberVar: 'X' }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any Number, 3 Suits, 2 Matching Dragons',
      },
      {
        displayName: 'Like Numbers #2',
        displayPattern: 'FFFF 11 1111 1111',
        patternGroups: [
          kong({ isAnyFlower: true }),
          pair({ suitVar: 'A', numberVar: 'X' }),
          kong({ suitVar: 'B', numberVar: 'X' }),
          kong({ suitVar: 'C', numberVar: 'X' }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any Number, 3 Suits',
      },
      {
        displayName: 'Like Numbers #3',
        displayPattern: '111 1111 1111 DD',
        patternGroups: [
          pung({ suitVar: 'A', numberVar: 'X' }),
          kong({ suitVar: 'B', numberVar: 'X' }),
          kong({ suitVar: 'C', numberVar: 'X' }),
          pair({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any Number, 3 Suits',
      },
      {
        displayName: 'Like Numbers #4',
        displayPattern: 'FF 111 111 111 111',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pung({ suitVar: 'A', numberVar: 'X' }),
          pung({ suitVar: 'B', numberVar: 'X' }),
          pung({ suitVar: 'C', numberVar: 'X' }),
          pung({ suitVar: 'A', numberVar: 'X' }),
        ],
        isConcealed: true,
        points: 30,
        notes: 'Any Number, 3 Suits, Concealed',
      },
    ],
  },
  {
    name: '13579',
    hands: [
      {
        displayName: '13579 #1',
        displayPattern: '111 3333 555 7777',
        patternGroups: [
          pung({ suitVar: 'A', constraints: { specificValues: [1] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [5] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [7] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: '13579 #2',
        displayPattern: 'FF 11 33 55 77 99',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pair({ suitVar: 'A', constraints: { specificValues: [1] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [7] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [9] } }),
        ],
        isConcealed: true,
        points: 25,
        notes: 'Any 1 Suit, Concealed',
      },
      {
        displayName: '13579 #3',
        displayPattern: '11 333 5555 777 99',
        patternGroups: [
          pair({ suitVar: 'A', constraints: { specificValues: [1] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [3] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [7] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [9] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: '13579 #4',
        displayPattern: 'FF 111 333 555 DDD',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pung({ suitVar: 'A', constraints: { specificValues: [1] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pung({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit, Matching Dragon',
      },
      {
        displayName: '13579 #5',
        displayPattern: '1111 33 5555 77 99',
        patternGroups: [
          kong({ suitVar: 'A', constraints: { specificValues: [1] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [3] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [7] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [9] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: '13579 #6',
        displayPattern: '111 3333 5555 99',
        patternGroups: [
          pung({ suitVar: 'A', constraints: { specificValues: [1] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [3] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [9] } }),
        ],
        isConcealed: false,
        points: 30,
        notes: 'Any 1 Suit',
      },
    ],
  },
  {
    name: 'CONSECUTIVE RUN',
    hands: [
      {
        displayName: 'Consec Run #1',
        displayPattern: '11 22 333 444 5555',
        patternGroups: [
          pair({ suitVar: 'A', numberVar: 'X' }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 1 }),
          pung({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          pung({ suitVar: 'A', numberVar: 'X', numberOffset: 3 }),
          kong({ suitVar: 'A', numberVar: 'X', numberOffset: 4 }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: 'Consec Run #2',
        displayPattern: '111 2222 3333 44',
        patternGroups: [
          pung({ suitVar: 'A', numberVar: 'X' }),
          kong({ suitVar: 'A', numberVar: 'X', numberOffset: 1 }),
          kong({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 3 }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: 'Consec Run #3',
        displayPattern: '11 222 3333 4444',
        patternGroups: [
          pair({ suitVar: 'A', numberVar: 'X' }),
          pung({ suitVar: 'A', numberVar: 'X', numberOffset: 1 }),
          kong({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          kong({ suitVar: 'A', numberVar: 'X', numberOffset: 3 }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: 'Consec Run #4',
        displayPattern: '1111 222 333 4444',
        patternGroups: [
          kong({ suitVar: 'A', numberVar: 'X' }),
          pung({ suitVar: 'A', numberVar: 'X', numberOffset: 1 }),
          pung({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          kong({ suitVar: 'A', numberVar: 'X', numberOffset: 3 }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: 'Consec Run #5',
        displayPattern: 'FF 11 22 33 44 55',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pair({ suitVar: 'A', numberVar: 'X' }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 1 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 3 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 4 }),
        ],
        isConcealed: true,
        points: 25,
        notes: 'Any 5 Consecutive Numbers, Concealed',
      },
      {
        displayName: 'Consec Run #6',
        displayPattern: '111 222 333 4444',
        patternGroups: [
          pung({ suitVar: 'A', numberVar: 'X' }),
          pung({ suitVar: 'B', numberVar: 'X', numberOffset: 1 }),
          pung({ suitVar: 'C', numberVar: 'X', numberOffset: 2 }),
          kong({ suitVar: 'A', numberVar: 'X', numberOffset: 3 }),
        ],
        isConcealed: false,
        points: 25,
        notes: '3 Suits',
      },
      {
        displayName: 'Consec Run #7',
        displayPattern: '11 222 333 444 55',
        patternGroups: [
          pair({ suitVar: 'A', numberVar: 'X' }),
          pung({ suitVar: 'B', numberVar: 'X', numberOffset: 1 }),
          pung({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          pung({ suitVar: 'B', numberVar: 'X', numberOffset: 3 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 4 }),
        ],
        isConcealed: false,
        points: 25,
        notes: '2 Suits',
      },
    ],
  },
  {
    name: '369',
    hands: [
      {
        displayName: '369 #1',
        displayPattern: '333 6666 666 9999',
        patternGroups: [
          pung({ suitVar: 'A', constraints: { specificValues: [3] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [6] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [9] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit',
      },
      {
        displayName: '369 #2',
        displayPattern: '33 66 99 33 66 99',
        patternGroups: [
          pair({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [6] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [9] } }),
          pair({ suitVar: 'B', constraints: { specificValues: [3] } }),
          pair({ suitVar: 'B', constraints: { specificValues: [6] } }),
          pair({ suitVar: 'B', constraints: { specificValues: [9] } }),
        ],
        isConcealed: true,
        points: 25,
        notes: 'Any 2 Suits, Concealed',
      },
      {
        displayName: '369 #3',
        displayPattern: '3333 66 9999 DD',
        patternGroups: [
          kong({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [9] } }),
          pair({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit, Matching Dragon',
      },
      {
        displayName: '369 #4',
        displayPattern: '33 66 333 666 999',
        patternGroups: [
          pair({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [6] } }),
          pung({ suitVar: 'B', constraints: { specificValues: [3] } }),
          pung({ suitVar: 'B', constraints: { specificValues: [6] } }),
          pung({ suitVar: 'B', constraints: { specificValues: [9] } }),
        ],
        isConcealed: false,
        points: 25,
        notes: '2 Suits',
      },
      {
        displayName: '369 #5',
        displayPattern: 'FF 33 666 9999 DD',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pair({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          kong({ suitVar: 'A', constraints: { specificValues: [9] } }),
          pair({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit, Matching Dragon',
      },
      {
        displayName: '369 #6',
        displayPattern: 'FF 333 666 999 DD',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pung({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [6] } }),
          pung({ suitVar: 'A', constraints: { specificValues: [9] } }),
          pair({ isAnyDragon: true }),
        ],
        isConcealed: false,
        points: 25,
        notes: 'Any 1 Suit, Matching Dragon',
      },
    ],
  },
  {
    name: 'SINGLES AND PAIRS',
    hands: [
      {
        displayName: 'Singles & Pairs #1',
        displayPattern: 'NN EE WW SS 11 11',
        patternGroups: [
          pair({ fixed: (TileType.WIND << 4) | NORTH }),
          pair({ fixed: (TileType.WIND << 4) | EAST }),
          pair({ fixed: (TileType.WIND << 4) | WEST }),
          pair({ fixed: (TileType.WIND << 4) | SOUTH }),
          pair({ suitVar: 'A', numberVar: 'X' }),
          pair({ suitVar: 'B', numberVar: 'X' }),
        ],
        isConcealed: true,
        points: 25,
        notes: 'Any 2 Suits, Same Number, Concealed',
      },
      {
        displayName: 'Singles & Pairs #2',
        displayPattern: '11 22 33 44 55 66',
        patternGroups: [
          pair({ suitVar: 'A', numberVar: 'X' }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 1 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 2 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 3 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 4 }),
          pair({ suitVar: 'A', numberVar: 'X', numberOffset: 5 }),
        ],
        isConcealed: true,
        points: 25,
        notes: 'Any 6 Consecutive Numbers, 1 Suit, Concealed',
      },
      {
        displayName: 'Singles & Pairs #3',
        displayPattern: '11 33 55 77 99 DD',
        patternGroups: [
          pair({ suitVar: 'A', constraints: { specificValues: [1] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [3] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [5] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [7] } }),
          pair({ suitVar: 'A', constraints: { specificValues: [9] } }),
          pair({ isAnyDragon: true }),
        ],
        isConcealed: true,
        points: 25,
        notes: 'Any 1 Suit, Matching Dragon, Concealed',
      },
      {
        displayName: 'Singles & Pairs #4',
        displayPattern: 'FF 11 DD 11 DD 11',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pair({ suitVar: 'A', numberVar: 'X' }),
          pair({ fixed: (TileType.DRAGON << 4) | RED }),
          pair({ suitVar: 'B', numberVar: 'X' }),
          pair({ fixed: (TileType.DRAGON << 4) | GREEN }),
          pair({ suitVar: 'C', numberVar: 'X' }),
        ],
        isConcealed: true,
        points: 25,
        notes: 'Any Like Numbers, 3 Suits, 2 Dragons, Concealed',
      },
      {
        displayName: 'Singles & Pairs #5',
        displayPattern: '2025 NEWS 2025',
        patternGroups: [
          single({ suitVar: 'A', constraints: { specificValues: [2] } }),
          single({ isZero: true }),
          single({ suitVar: 'A', constraints: { specificValues: [2] } }),
          single({ suitVar: 'A', constraints: { specificValues: [5] } }),
          single({ fixed: (TileType.WIND << 4) | NORTH }),
          single({ fixed: (TileType.WIND << 4) | EAST }),
          single({ fixed: (TileType.WIND << 4) | WEST }),
          single({ fixed: (TileType.WIND << 4) | SOUTH }),
          single({ suitVar: 'B', constraints: { specificValues: [2] } }),
          single({ isZero: true }),
          single({ suitVar: 'B', constraints: { specificValues: [2] } }),
          single({ suitVar: 'B', constraints: { specificValues: [5] } }),
        ],
        isConcealed: true,
        points: 30,
        notes: '2 Suits, Concealed',
      },
      {
        displayName: 'Singles & Pairs #6',
        displayPattern: 'FF DD DD GG RR WW',
        patternGroups: [
          pair({ isAnyFlower: true }),
          pair({ fixed: (TileType.DRAGON << 4) | GREEN }),
          pair({ fixed: (TileType.DRAGON << 4) | RED }),
          pair({ fixed: (TileType.DRAGON << 4) | GREEN }),
          pair({ fixed: (TileType.DRAGON << 4) | RED }),
          pair({ fixed: (TileType.DRAGON << 4) | WHITE }),
        ],
        isConcealed: true,
        points: 30,
        notes: 'Concealed',
      },
    ],
  },
];

async function seed() {
  // Initialize database
  initDb({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mjbuddy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('Creating card year NMJL_2025...');

    // Create or update card year
    const yearResult = await query<{ id: number }>(
      `INSERT INTO card_years (year, name, is_active, created_at)
       VALUES (:year, :name, :isActive, NOW())
       ON CONFLICT (year) DO UPDATE SET name = :name
       RETURNING id`,
      { year: 2025, name: 'NMJL_2025', isActive: true }
    );
    const cardYearId = yearResult.rows[0].id;
    console.log(`Card year created/updated with ID: ${cardYearId}`);

    // Clear existing categories and hands for this year
    console.log('Clearing existing categories and hands...');
    await query(
      `DELETE FROM card_hands WHERE category_id IN (SELECT id FROM hand_categories WHERE card_year_id = :cardYearId)`,
      { cardYearId }
    );
    await query(
      `DELETE FROM hand_categories WHERE card_year_id = :cardYearId`,
      { cardYearId }
    );

    // Create categories and hands
    let categoryOrder = 1;
    for (const category of categories) {
      console.log(`Creating category: ${category.name}`);

      // Create category
      const catResult = await query<{ id: number }>(
        `INSERT INTO hand_categories (card_year_id, name, display_order, created_at)
         VALUES (:cardYearId, :name, :displayOrder, NOW())
         RETURNING id`,
        { cardYearId, name: category.name, displayOrder: categoryOrder++ }
      );
      const categoryId = catResult.rows[0].id;

      // Create hands
      let handOrder = 1;
      for (const hand of category.hands) {
        console.log(`  Creating hand: ${hand.displayName}`);
        await query(
          `INSERT INTO card_hands (category_id, display_name, display_pattern, pattern_json,
                                   is_concealed, points, notes, display_order, created_at)
           VALUES (:categoryId, :displayName, :displayPattern, :patternJson,
                   :isConcealed, :points, :notes, :displayOrder, NOW())`,
          {
            categoryId,
            displayName: hand.displayName,
            displayPattern: hand.displayPattern,
            patternJson: JSON.stringify(hand.patternGroups),
            isConcealed: hand.isConcealed,
            points: hand.points,
            notes: hand.notes,
            displayOrder: handOrder++,
          }
        );
      }
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

seed().catch(console.error);
