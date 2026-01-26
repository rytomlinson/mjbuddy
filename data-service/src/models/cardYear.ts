import { get, getOne, query } from 'common';
import type { CardYear, CreateCardYear, UpdateCardYear } from 'common';

interface CardYearRow {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
  created_at: Date;
}

function mapRowToCardYear(row: CardYearRow): CardYear {
  return {
    id: row.id,
    year: row.year,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function getAllCardYears(): Promise<CardYear[]> {
  return get<CardYearRow, CardYear>(
    `SELECT id, year, name, is_active, created_at
     FROM card_years
     ORDER BY year DESC`,
    mapRowToCardYear
  );
}

export async function getCardYearById(id: number): Promise<CardYear | null> {
  return getOne<CardYearRow, CardYear>(
    `SELECT id, year, name, is_active, created_at
     FROM card_years
     WHERE id = :id`,
    mapRowToCardYear,
    { id }
  );
}

export async function getCardYearByYear(year: number): Promise<CardYear | null> {
  return getOne<CardYearRow, CardYear>(
    `SELECT id, year, name, is_active, created_at
     FROM card_years
     WHERE year = :year`,
    mapRowToCardYear,
    { year }
  );
}

export async function getActiveCardYear(): Promise<CardYear | null> {
  return getOne<CardYearRow, CardYear>(
    `SELECT id, year, name, is_active, created_at
     FROM card_years
     WHERE is_active = true
     LIMIT 1`,
    mapRowToCardYear
  );
}

export async function createCardYear(data: CreateCardYear): Promise<CardYear> {
  const result = await query<CardYearRow>(
    `INSERT INTO card_years (year, name, is_active, created_at)
     VALUES (:year, :name, :isActive, NOW())
     RETURNING id, year, name, is_active, created_at`,
    {
      year: data.year,
      name: data.name,
      isActive: data.isActive ?? false,
    }
  );
  return mapRowToCardYear(result.rows[0]);
}

export async function updateCardYear(data: UpdateCardYear): Promise<CardYear | null> {
  const current = await getCardYearById(data.id);
  if (!current) {
    return null;
  }

  const result = await query<CardYearRow>(
    `UPDATE card_years
     SET year = :year,
         name = :name,
         is_active = :isActive
     WHERE id = :id
     RETURNING id, year, name, is_active, created_at`,
    {
      id: data.id,
      year: data.year ?? current.year,
      name: data.name ?? current.name,
      isActive: data.isActive ?? current.isActive,
    }
  );
  return result.rows[0] ? mapRowToCardYear(result.rows[0]) : null;
}

export async function setActiveCardYear(id: number): Promise<CardYear | null> {
  // First, deactivate all card years
  await query(`UPDATE card_years SET is_active = false`, {});

  // Then activate the specified one
  const result = await query<CardYearRow>(
    `UPDATE card_years
     SET is_active = true
     WHERE id = :id
     RETURNING id, year, name, is_active, created_at`,
    { id }
  );
  return result.rows[0] ? mapRowToCardYear(result.rows[0]) : null;
}

export async function deleteCardYear(id: number): Promise<boolean> {
  const result = await query(`DELETE FROM card_years WHERE id = :id`, { id });
  return result.rowCount > 0;
}
