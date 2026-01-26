import { get, getOne, query } from '../db.js';
import type { CardHand, CreateCardHand, UpdateCardHand, PatternGroup } from 'common';

interface CardHandRow {
  id: number;
  category_id: number;
  display_name: string;
  display_pattern: string;
  pattern_json: PatternGroup[];
  is_concealed: boolean;
  points: number;
  notes: string | null;
  display_order: number;
  created_at: Date;
}

function mapRowToCardHand(row: CardHandRow): CardHand {
  return {
    id: row.id,
    categoryId: row.category_id,
    displayName: row.display_name,
    displayPattern: row.display_pattern,
    patternGroups: row.pattern_json,
    isConcealed: row.is_concealed,
    points: row.points,
    notes: row.notes,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

export async function getHandsByCategory(categoryId: number): Promise<CardHand[]> {
  return get<CardHandRow, CardHand>(
    `SELECT id, category_id, display_name, display_pattern, pattern_json,
            is_concealed, points, notes, display_order, created_at
     FROM card_hands
     WHERE category_id = :categoryId
     ORDER BY display_order ASC`,
    mapRowToCardHand,
    { categoryId }
  );
}

export async function getHandsByCardYear(cardYearId: number): Promise<CardHand[]> {
  return get<CardHandRow, CardHand>(
    `SELECT ch.id, ch.category_id, ch.display_name, ch.display_pattern, ch.pattern_json,
            ch.is_concealed, ch.points, ch.notes, ch.display_order, ch.created_at
     FROM card_hands ch
     JOIN hand_categories hc ON hc.id = ch.category_id
     WHERE hc.card_year_id = :cardYearId
     ORDER BY hc.display_order ASC, ch.display_order ASC`,
    mapRowToCardHand,
    { cardYearId }
  );
}

export async function getCardHandById(id: number): Promise<CardHand | null> {
  return getOne<CardHandRow, CardHand>(
    `SELECT id, category_id, display_name, display_pattern, pattern_json,
            is_concealed, points, notes, display_order, created_at
     FROM card_hands
     WHERE id = :id`,
    mapRowToCardHand,
    { id }
  );
}

export async function createCardHand(data: CreateCardHand): Promise<CardHand> {
  const result = await query<CardHandRow>(
    `INSERT INTO card_hands (category_id, display_name, display_pattern, pattern_json,
                             is_concealed, points, notes, display_order, created_at)
     VALUES (:categoryId, :displayName, :displayPattern, :patternJson,
             :isConcealed, :points, :notes, :displayOrder, NOW())
     RETURNING id, category_id, display_name, display_pattern, pattern_json,
               is_concealed, points, notes, display_order, created_at`,
    {
      categoryId: data.categoryId,
      displayName: data.displayName,
      displayPattern: data.displayPattern,
      patternJson: JSON.stringify(data.patternGroups),
      isConcealed: data.isConcealed,
      points: data.points,
      notes: data.notes ?? null,
      displayOrder: data.displayOrder,
    }
  );
  return mapRowToCardHand(result.rows[0]);
}

export async function updateCardHand(data: UpdateCardHand): Promise<CardHand | null> {
  const current = await getCardHandById(data.id);
  if (!current) {
    return null;
  }

  const result = await query<CardHandRow>(
    `UPDATE card_hands
     SET category_id = :categoryId,
         display_name = :displayName,
         display_pattern = :displayPattern,
         pattern_json = :patternJson,
         is_concealed = :isConcealed,
         points = :points,
         notes = :notes,
         display_order = :displayOrder
     WHERE id = :id
     RETURNING id, category_id, display_name, display_pattern, pattern_json,
               is_concealed, points, notes, display_order, created_at`,
    {
      id: data.id,
      categoryId: data.categoryId ?? current.categoryId,
      displayName: data.displayName ?? current.displayName,
      displayPattern: data.displayPattern ?? current.displayPattern,
      patternJson: JSON.stringify(data.patternGroups ?? current.patternGroups),
      isConcealed: data.isConcealed ?? current.isConcealed,
      points: data.points ?? current.points,
      notes: data.notes !== undefined ? data.notes : current.notes,
      displayOrder: data.displayOrder ?? current.displayOrder,
    }
  );
  return result.rows[0] ? mapRowToCardHand(result.rows[0]) : null;
}

export async function deleteCardHand(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM card_hands WHERE id = :id`, { id });
  return result.rowCount > 0;
}
