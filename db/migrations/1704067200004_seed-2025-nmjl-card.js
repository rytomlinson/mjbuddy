/**
 * Seed the 2025 NMJL Card data
 *
 * Pattern encoding:
 * - TileType: DOT=1, BAM=2, CRAK=3, WIND=4, DRAGON=5, FLOWER=6, JOKER=7
 * - TileCode: (TileType << 4) | value
 * - GroupType: SINGLE=1, PAIR=2, PUNG=3, KONG=4, QUINT=5, SEXTET=6
 */

// Helper to create tile codes
const TileType = { DOT: 1, BAM: 2, CRAK: 3, WIND: 4, DRAGON: 5, FLOWER: 6, JOKER: 7 };
const Wind = { EAST: 1, SOUTH: 2, WEST: 3, NORTH: 4 };
const Dragon = { RED: 1, GREEN: 2, WHITE: 3 };
const GroupType = { SINGLE: 1, PAIR: 2, PUNG: 3, KONG: 4, QUINT: 5, SEXTET: 6 };

const tile = (type, value) => (type << 4) | value;

// Fixed tiles
const TILES = {
  FLOWER: tile(TileType.FLOWER, 1),
  RED_DRAGON: tile(TileType.DRAGON, Dragon.RED),
  GREEN_DRAGON: tile(TileType.DRAGON, Dragon.GREEN),
  WHITE_DRAGON: tile(TileType.DRAGON, Dragon.WHITE),
  EAST: tile(TileType.WIND, Wind.EAST),
  SOUTH: tile(TileType.WIND, Wind.SOUTH),
  WEST: tile(TileType.WIND, Wind.WEST),
  NORTH: tile(TileType.WIND, Wind.NORTH),
};

// Pattern helpers
const fixed = (tileCode) => ({ fixed: tileCode });
const suitNum = (suitVar, numVar, offset = 0) => ({
  suitVar,
  numberVar: numVar,
  numberOffset: offset || undefined,
});
const suitFixed = (suitVar, value) => ({
  suitVar,
  constraints: { specificValues: [value] },
});
const anyFlower = () => ({ isAnyFlower: true });
const anyDragon = () => ({ isAnyDragon: true });
const anyWind = () => ({ isAnyWind: true });
const zero = () => ({ isZero: true }); // White dragon as 0
const evenNum = (suitVar, numVar) => ({
  suitVar,
  numberVar: numVar,
  constraints: { evenOnly: true },
});
const oddNum = (suitVar, numVar) => ({
  suitVar,
  numberVar: numVar,
  constraints: { oddOnly: true },
});
const numRange = (suitVar, numVar, min, max) => ({
  suitVar,
  numberVar: numVar,
  constraints: { range: [min, max] },
});

// Group helpers
const single = (tile) => ({ type: GroupType.SINGLE, tile });
const pair = (tile) => ({ type: GroupType.PAIR, tile });
const pung = (tile) => ({ type: GroupType.PUNG, tile });
const kong = (tile) => ({ type: GroupType.KONG, tile });
const quint = (tile) => ({ type: GroupType.QUINT, tile });
const sextet = (tile) => ({ type: GroupType.SEXTET, tile });

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = async (pgm) => {
  // Insert 2025 card year
  const cardYearResult = await pgm.db.query(
    `INSERT INTO card_years (year, name, is_active) VALUES (2025, '2025 NMJL Card', true) RETURNING id`
  );
  const cardYearId = cardYearResult.rows[0].id;

  // Categories with their display order
  const categories = [
    { name: '2025', displayOrder: 1 },
    { name: '2468', displayOrder: 2 },
    { name: '13579', displayOrder: 3 },
    { name: '369', displayOrder: 4 },
    { name: 'Any Like Numbers', displayOrder: 5 },
    { name: 'Consecutive Run', displayOrder: 6 },
    { name: 'Quints', displayOrder: 7 },
    { name: 'Winds & Dragons', displayOrder: 8 },
    { name: 'Singles & Pairs', displayOrder: 9 },
  ];

  const categoryIds = {};
  for (const cat of categories) {
    const result = await pgm.db.query(
      `INSERT INTO hand_categories (card_year_id, name, display_order) VALUES ($1, $2, $3) RETURNING id`,
      [cardYearId, cat.name, cat.displayOrder]
    );
    categoryIds[cat.name] = result.rows[0].id;
  }

  // Define hands for each category
  const hands = [
    // ==================== 2025 ====================
    {
      categoryId: categoryIds['2025'],
      displayName: '2025 #1',
      displayPattern: 'FF 2025 DDDD DDDD',
      patternGroups: [
        pair(anyFlower()),
        single(suitFixed('A', 2)),
        single(zero()),
        single(suitFixed('A', 2)),
        single(suitFixed('A', 5)),
        kong(anyDragon()),
        kong(anyDragon()),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 2 suits, any 2 dragons',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['2025'],
      displayName: '2025 #2',
      displayPattern: '222 000 222 555',
      patternGroups: [
        pung(suitFixed('A', 2)),
        pung(zero()),
        pung(suitFixed('B', 2)),
        pung(suitFixed('C', 5)),
      ],
      isConcealed: false,
      points: 25,
      notes: '3 suits',
      displayOrder: 2,
    },
    {
      categoryId: categoryIds['2025'],
      displayName: '2025 #3',
      displayPattern: '2222 00 2222 55',
      patternGroups: [
        kong(suitFixed('A', 2)),
        pair(zero()),
        kong(suitFixed('B', 2)),
        pair(suitFixed('C', 5)),
      ],
      isConcealed: false,
      points: 25,
      notes: '3 suits, 0=White Dragon',
      displayOrder: 3,
    },
    {
      categoryId: categoryIds['2025'],
      displayName: '2025 #4',
      displayPattern: 'FFFF 2025 2025',
      patternGroups: [
        kong(anyFlower()),
        single(suitFixed('A', 2)),
        single(zero()),
        single(suitFixed('A', 2)),
        single(suitFixed('A', 5)),
        single(suitFixed('B', 2)),
        single(zero()),
        single(suitFixed('B', 2)),
        single(suitFixed('B', 5)),
      ],
      isConcealed: true,
      points: 30,
      notes: 'Concealed, 2 suits',
      displayOrder: 4,
    },

    // ==================== 2468 ====================
    {
      categoryId: categoryIds['2468'],
      displayName: '2468 #1',
      displayPattern: 'FF 2222 4444 DD',
      patternGroups: [
        pair(anyFlower()),
        kong(suitFixed('A', 2)),
        kong(suitFixed('A', 4)),
        pair(anyDragon()),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit, matching dragon',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['2468'],
      displayName: '2468 #2',
      displayPattern: '22 444 6666 888',
      patternGroups: [
        pair(suitFixed('A', 2)),
        pung(suitFixed('A', 4)),
        kong(suitFixed('A', 6)),
        pung(suitFixed('A', 8)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit',
      displayOrder: 2,
    },
    {
      categoryId: categoryIds['2468'],
      displayName: '2468 #3',
      displayPattern: '222 444 66 8888',
      patternGroups: [
        pung(suitFixed('A', 2)),
        pung(suitFixed('A', 4)),
        pair(suitFixed('A', 6)),
        kong(suitFixed('A', 8)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit',
      displayOrder: 3,
    },
    {
      categoryId: categoryIds['2468'],
      displayName: '2468 #4',
      displayPattern: '2468 2468 2468 DD',
      patternGroups: [
        single(suitFixed('A', 2)),
        single(suitFixed('A', 4)),
        single(suitFixed('A', 6)),
        single(suitFixed('A', 8)),
        single(suitFixed('B', 2)),
        single(suitFixed('B', 4)),
        single(suitFixed('B', 6)),
        single(suitFixed('B', 8)),
        single(suitFixed('C', 2)),
        single(suitFixed('C', 4)),
        single(suitFixed('C', 6)),
        single(suitFixed('C', 8)),
        pair(anyDragon()),
      ],
      isConcealed: true,
      points: 30,
      notes: 'Concealed, 3 suits',
      displayOrder: 4,
    },

    // ==================== 13579 ====================
    {
      categoryId: categoryIds['13579'],
      displayName: '13579 #1',
      displayPattern: 'FF 111 333 5555',
      patternGroups: [
        pair(anyFlower()),
        pung(suitFixed('A', 1)),
        pung(suitFixed('A', 3)),
        kong(suitFixed('A', 5)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['13579'],
      displayName: '13579 #2',
      displayPattern: '111 3333 555 77',
      patternGroups: [
        pung(suitFixed('A', 1)),
        kong(suitFixed('A', 3)),
        pung(suitFixed('A', 5)),
        pair(suitFixed('A', 7)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit',
      displayOrder: 2,
    },
    {
      categoryId: categoryIds['13579'],
      displayName: '13579 #3',
      displayPattern: '11 333 5555 999',
      patternGroups: [
        pair(suitFixed('A', 1)),
        pung(suitFixed('A', 3)),
        kong(suitFixed('A', 5)),
        pung(suitFixed('A', 9)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit',
      displayOrder: 3,
    },
    {
      categoryId: categoryIds['13579'],
      displayName: '13579 #4',
      displayPattern: '1111 333 555 99',
      patternGroups: [
        kong(suitFixed('A', 1)),
        pung(suitFixed('A', 3)),
        pung(suitFixed('A', 5)),
        pair(suitFixed('A', 9)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit',
      displayOrder: 4,
    },

    // ==================== 369 ====================
    {
      categoryId: categoryIds['369'],
      displayName: '369 #1',
      displayPattern: 'FF 3333 6666 99',
      patternGroups: [
        pair(anyFlower()),
        kong(suitFixed('A', 3)),
        kong(suitFixed('A', 6)),
        pair(suitFixed('A', 9)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['369'],
      displayName: '369 #2',
      displayPattern: '33 6666 9999 DD',
      patternGroups: [
        pair(suitFixed('A', 3)),
        kong(suitFixed('A', 6)),
        kong(suitFixed('A', 9)),
        pair(anyDragon()),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit, matching dragon',
      displayOrder: 2,
    },
    {
      categoryId: categoryIds['369'],
      displayName: '369 #3',
      displayPattern: '333 666 999 DDD',
      patternGroups: [
        pung(suitFixed('A', 3)),
        pung(suitFixed('A', 6)),
        pung(suitFixed('A', 9)),
        pung(anyDragon()),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit, matching dragon',
      displayOrder: 3,
    },

    // ==================== Any Like Numbers ====================
    {
      categoryId: categoryIds['Any Like Numbers'],
      displayName: 'Like Numbers #1',
      displayPattern: 'FF XXXX XXXX XX',
      patternGroups: [
        pair(anyFlower()),
        kong(suitFixed('A', 0)), // Placeholder - any number
        kong(suitFixed('B', 0)),
        pair(suitFixed('C', 0)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 3 suits, same number (like 1111 1111 11)',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['Any Like Numbers'],
      displayName: 'Like Numbers #2',
      displayPattern: 'XXXX XXXX DDDD',
      patternGroups: [
        kong(suitNum('A', 'X')),
        kong(suitNum('B', 'X')),
        kong(anyDragon()),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 2 suits same number, any dragon kong',
      displayOrder: 2,
    },

    // ==================== Consecutive Run ====================
    {
      categoryId: categoryIds['Consecutive Run'],
      displayName: 'Consec Run #1',
      displayPattern: 'FF 111 222 3333',
      patternGroups: [
        pair(anyFlower()),
        pung(suitNum('A', 'X', 0)),
        pung(suitNum('A', 'X', 1)),
        kong(suitNum('A', 'X', 2)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit, any 3 consecutive numbers',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['Consecutive Run'],
      displayName: 'Consec Run #2',
      displayPattern: '11 222 3333 444',
      patternGroups: [
        pair(suitNum('A', 'X', 0)),
        pung(suitNum('A', 'X', 1)),
        kong(suitNum('A', 'X', 2)),
        pung(suitNum('A', 'X', 3)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit, any 4 consecutive numbers',
      displayOrder: 2,
    },
    {
      categoryId: categoryIds['Consecutive Run'],
      displayName: 'Consec Run #3',
      displayPattern: '111 2222 333 44',
      patternGroups: [
        pung(suitNum('A', 'X', 0)),
        kong(suitNum('A', 'X', 1)),
        pung(suitNum('A', 'X', 2)),
        pair(suitNum('A', 'X', 3)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit, any 4 consecutive numbers',
      displayOrder: 3,
    },
    {
      categoryId: categoryIds['Consecutive Run'],
      displayName: 'Consec Run #4',
      displayPattern: '1111 222 333 44',
      patternGroups: [
        kong(suitNum('A', 'X', 0)),
        pung(suitNum('A', 'X', 1)),
        pung(suitNum('A', 'X', 2)),
        pair(suitNum('A', 'X', 3)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'Any 1 suit, any 4 consecutive numbers',
      displayOrder: 4,
    },

    // ==================== Quints ====================
    {
      categoryId: categoryIds['Quints'],
      displayName: 'Quints #1',
      displayPattern: 'XXXXX XX XXXXX',
      patternGroups: [
        quint(suitNum('A', 'X')),
        pair(suitNum('A', 'Y')),
        quint(suitNum('A', 'Z')),
      ],
      isConcealed: false,
      points: 40,
      notes: 'Any 1 suit, 3 different numbers',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['Quints'],
      displayName: 'Quints #2',
      displayPattern: 'FFFF XXXXX XXXX',
      patternGroups: [
        kong(anyFlower()),
        quint(suitNum('A', 'X')),
        kong(suitNum('A', 'Y')),
      ],
      isConcealed: false,
      points: 45,
      notes: 'Any 1 suit, 2 different numbers',
      displayOrder: 2,
    },

    // ==================== Winds & Dragons ====================
    {
      categoryId: categoryIds['Winds & Dragons'],
      displayName: 'Winds Dragons #1',
      displayPattern: 'NN EEE WWW SSSS',
      patternGroups: [
        pair(fixed(TILES.NORTH)),
        pung(fixed(TILES.EAST)),
        pung(fixed(TILES.WEST)),
        kong(fixed(TILES.SOUTH)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'NEWS winds',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['Winds & Dragons'],
      displayName: 'Winds Dragons #2',
      displayPattern: 'NNNN EE WWWW SS',
      patternGroups: [
        kong(fixed(TILES.NORTH)),
        pair(fixed(TILES.EAST)),
        kong(fixed(TILES.WEST)),
        pair(fixed(TILES.SOUTH)),
      ],
      isConcealed: false,
      points: 25,
      notes: 'NEWS winds',
      displayOrder: 2,
    },
    {
      categoryId: categoryIds['Winds & Dragons'],
      displayName: 'Winds Dragons #3',
      displayPattern: 'FF DDDD DDD DDD',
      patternGroups: [
        pair(anyFlower()),
        kong(fixed(TILES.RED_DRAGON)),
        pung(fixed(TILES.GREEN_DRAGON)),
        pung(fixed(TILES.WHITE_DRAGON)),
      ],
      isConcealed: false,
      points: 30,
      notes: 'All 3 dragons',
      displayOrder: 3,
    },
    {
      categoryId: categoryIds['Winds & Dragons'],
      displayName: 'Winds Dragons #4',
      displayPattern: 'NEWS NEWS DDDD',
      patternGroups: [
        single(fixed(TILES.NORTH)),
        single(fixed(TILES.EAST)),
        single(fixed(TILES.WEST)),
        single(fixed(TILES.SOUTH)),
        single(fixed(TILES.NORTH)),
        single(fixed(TILES.EAST)),
        single(fixed(TILES.WEST)),
        single(fixed(TILES.SOUTH)),
        kong(anyDragon()),
      ],
      isConcealed: true,
      points: 30,
      notes: 'Concealed, any dragon kong',
      displayOrder: 4,
    },

    // ==================== Singles & Pairs ====================
    {
      categoryId: categoryIds['Singles & Pairs'],
      displayName: 'Singles Pairs #1',
      displayPattern: 'FF 11 33 55 77 99',
      patternGroups: [
        pair(anyFlower()),
        pair(suitFixed('A', 1)),
        pair(suitFixed('A', 3)),
        pair(suitFixed('A', 5)),
        pair(suitFixed('A', 7)),
        pair(suitFixed('A', 9)),
      ],
      isConcealed: true,
      points: 50,
      notes: 'Concealed, any 1 suit',
      displayOrder: 1,
    },
    {
      categoryId: categoryIds['Singles & Pairs'],
      displayName: 'Singles Pairs #2',
      displayPattern: 'FF 22 44 66 88 DD',
      patternGroups: [
        pair(anyFlower()),
        pair(suitFixed('A', 2)),
        pair(suitFixed('A', 4)),
        pair(suitFixed('A', 6)),
        pair(suitFixed('A', 8)),
        pair(anyDragon()),
      ],
      isConcealed: true,
      points: 50,
      notes: 'Concealed, any 1 suit, matching dragon',
      displayOrder: 2,
    },
    {
      categoryId: categoryIds['Singles & Pairs'],
      displayName: 'Singles Pairs #3',
      displayPattern: '11 22 33 44 55 66',
      patternGroups: [
        pair(suitFixed('A', 1)),
        pair(suitFixed('A', 2)),
        pair(suitFixed('A', 3)),
        pair(suitFixed('A', 4)),
        pair(suitFixed('A', 5)),
        pair(suitFixed('A', 6)),
      ],
      isConcealed: true,
      points: 75,
      notes: 'Concealed, any 1 suit, 6 consecutive pairs',
      displayOrder: 3,
    },
  ];

  // Insert all hands
  for (const hand of hands) {
    await pgm.db.query(
      `INSERT INTO card_hands (category_id, display_name, display_pattern, pattern_json, is_concealed, points, notes, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        hand.categoryId,
        hand.displayName,
        hand.displayPattern,
        JSON.stringify(hand.patternGroups),
        hand.isConcealed,
        hand.points,
        hand.notes,
        hand.displayOrder,
      ]
    );
  }
};

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = async (pgm) => {
  // Delete the 2025 card year (cascades to categories and hands)
  await pgm.db.query(`DELETE FROM card_years WHERE year = 2025`);
};
