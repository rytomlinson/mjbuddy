/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('hand_categories', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    card_year_id: {
      type: 'integer',
      notNull: true,
      references: 'card_years',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
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

  pgm.createIndex('hand_categories', 'card_year_id');
};

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('hand_categories');
};
