import { get, getOne, query } from '../../../common/src/db.js';
import type { HandCategoryRecord, CreateHandCategory } from 'common';

interface HandCategoryRow {
  id: number;
  card_year_id: number;
  name: string;
  display_order: number;
  created_at: Date;
}

function mapRowToHandCategory(row: HandCategoryRow): HandCategoryRecord {
  return {
    id: row.id,
    cardYearId: row.card_year_id,
    name: row.name,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

export async function getCategoriesByCardYear(cardYearId: number): Promise<HandCategoryRecord[]> {
  return get<HandCategoryRow, HandCategoryRecord>(
    `SELECT id, card_year_id, name, display_order, created_at
     FROM hand_categories
     WHERE card_year_id = :cardYearId
     ORDER BY display_order ASC`,
    mapRowToHandCategory,
    { cardYearId }
  );
}

export async function getHandCategoryById(id: number): Promise<HandCategoryRecord | null> {
  return getOne<HandCategoryRow, HandCategoryRecord>(
    `SELECT id, card_year_id, name, display_order, created_at
     FROM hand_categories
     WHERE id = :id`,
    mapRowToHandCategory,
    { id }
  );
}

export async function createHandCategory(data: CreateHandCategory): Promise<HandCategoryRecord> {
  const result = await query<HandCategoryRow>(
    `INSERT INTO hand_categories (card_year_id, name, display_order, created_at)
     VALUES (:cardYearId, :name, :displayOrder, NOW())
     RETURNING id, card_year_id, name, display_order, created_at`,
    {
      cardYearId: data.cardYearId,
      name: data.name,
      displayOrder: data.displayOrder,
    }
  );
  return mapRowToHandCategory(result.rows[0]);
}

export async function deleteHandCategory(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM hand_categories WHERE id = :id`, { id });
  return result.rowCount > 0;
}
