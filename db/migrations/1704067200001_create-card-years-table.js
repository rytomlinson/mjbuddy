/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('card_years', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    year: {
      type: 'integer',
      notNull: true,
      unique: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('card_years', 'year');
  pgm.createIndex('card_years', 'is_active');
};

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('card_years');
};
