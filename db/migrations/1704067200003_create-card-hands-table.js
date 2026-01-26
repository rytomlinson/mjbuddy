/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('card_hands', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    category_id: {
      type: 'integer',
      notNull: true,
      references: 'hand_categories',
      onDelete: 'CASCADE',
    },
    display_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    display_pattern: {
      type: 'text',
      notNull: true,
    },
    pattern_json: {
      type: 'jsonb',
      notNull: true,
    },
    is_concealed: {
      type: 'boolean',
      notNull: true,
    },
    points: {
      type: 'integer',
      notNull: true,
    },
    notes: {
      type: 'text',
    },
    display_order: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('card_hands', 'category_id');
  pgm.createIndex('card_hands', 'points');
  pgm.createIndex('card_hands', 'is_concealed');
};

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('card_hands');
};
