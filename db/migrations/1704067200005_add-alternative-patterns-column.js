/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.addColumn('card_hands', {
    alternative_patterns_json: {
      type: 'jsonb',
    },
  });
};

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropColumn('card_hands', 'alternative_patterns_json');
};
