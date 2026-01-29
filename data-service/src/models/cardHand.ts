import { get, getOne, query } from '../db.js';
import type { CardHand, CreateCardHand, UpdateCardHand, PatternGroup, HandExample } from 'common';

interface CardHandRow {
  id: number;
  category_id: number;
  display_name: string;
  display_pattern: string;
  pattern_json: PatternGroup[];
  alternative_patterns_json: PatternGroup[][] | null;
  is_concealed: boolean;
  points: number;
  notes: string | null;
  display_order: number;
  examples_json: HandExample[] | null;
  created_at: Date;
}

function mapRowToCardHand(row: CardHandRow): CardHand {
  return {
    id: row.id,
    categoryId: row.category_id,
    displayName: row.display_name,
    displayPattern: row.display_pattern,
    patternGroups: row.pattern_json,
    alternativePatterns: row.alternative_patterns_json ?? undefined,
    isConcealed: row.is_concealed,
    points: row.points,
    notes: row.notes,
    displayOrder: row.display_order,
    examples: row.examples_json ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getHandsByCategory(categoryId: number): Promise<CardHand[]> {
  return get<CardHandRow, CardHand>(
    `SELECT id, category_id, display_name, display_pattern, pattern_json,
            alternative_patterns_json, is_concealed, points, notes, display_order,
            examples_json, created_at
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
            ch.alternative_patterns_json, ch.is_concealed, ch.points, ch.notes, ch.display_order,
            ch.examples_json, ch.created_at
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
            alternative_patterns_json, is_concealed, points, notes, display_order,
            examples_json, created_at
     FROM card_hands
     WHERE id = :id`,
    mapRowToCardHand,
    { id }
  );
}

export async function createCardHand(data: CreateCardHand): Promise<CardHand> {
  const result = await query<CardHandRow>(
    `INSERT INTO card_hands (category_id, display_name, display_pattern, pattern_json,
                             alternative_patterns_json, is_concealed, points, notes,
                             display_order, examples_json, created_at)
     VALUES (:categoryId, :displayName, :displayPattern, :patternJson,
             :alternativePatternsJson, :isConcealed, :points, :notes, :displayOrder,
             :examplesJson, NOW())
     RETURNING id, category_id, display_name, display_pattern, pattern_json,
               alternative_patterns_json, is_concealed, points, notes, display_order,
               examples_json, created_at`,
    {
      categoryId: data.categoryId,
      displayName: data.displayName,
      displayPattern: data.displayPattern,
      patternJson: JSON.stringify(data.patternGroups),
      alternativePatternsJson: data.alternativePatterns ? JSON.stringify(data.alternativePatterns) : null,
      isConcealed: data.isConcealed,
      points: data.points,
      notes: data.notes ?? null,
      displayOrder: data.displayOrder,
      examplesJson: data.examples ? JSON.stringify(data.examples) : null,
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
         alternative_patterns_json = :alternativePatternsJson,
         is_concealed = :isConcealed,
         points = :points,
         notes = :notes,
         display_order = :displayOrder,
         examples_json = :examplesJson
     WHERE id = :id
     RETURNING id, category_id, display_name, display_pattern, pattern_json,
               alternative_patterns_json, is_concealed, points, notes, display_order,
               examples_json, created_at`,
    {
      id: data.id,
      categoryId: data.categoryId ?? current.categoryId,
      displayName: data.displayName ?? current.displayName,
      displayPattern: data.displayPattern ?? current.displayPattern,
      patternJson: JSON.stringify(data.patternGroups ?? current.patternGroups),
      alternativePatternsJson: data.alternativePatterns !== undefined
        ? (data.alternativePatterns ? JSON.stringify(data.alternativePatterns) : null)
        : (current.alternativePatterns ? JSON.stringify(current.alternativePatterns) : null),
      isConcealed: data.isConcealed ?? current.isConcealed,
      points: data.points ?? current.points,
      notes: data.notes !== undefined ? data.notes : current.notes,
      displayOrder: data.displayOrder ?? current.displayOrder,
      examplesJson: data.examples !== undefined
        ? (data.examples ? JSON.stringify(data.examples) : null)
        : (current.examples ? JSON.stringify(current.examples) : null),
    }
  );
  return result.rows[0] ? mapRowToCardHand(result.rows[0]) : null;
}

export async function deleteCardHand(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM card_hands WHERE id = :id`, { id });
  return result.rowCount > 0;
}

export async function reorderHands(handIds: number[]): Promise<void> {
  // Update display_order for each hand based on its position in the array
  for (let i = 0; i < handIds.length; i++) {
    await query(
      `UPDATE card_hands SET display_order = :displayOrder WHERE id = :id`,
      { id: handIds[i], displayOrder: i + 1 }
    );
  }
}
