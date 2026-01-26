import { get, getOne, query } from '../db.js';
import type { Item, CreateItem, UpdateItem } from 'common';

interface ItemRow {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapRowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllItems(): Promise<Item[]> {
  return get<ItemRow, Item>(
    `SELECT id, name, description, created_at, updated_at
     FROM items
     ORDER BY created_at DESC`,
    mapRowToItem
  );
}

export async function getItemById(id: number): Promise<Item | null> {
  return getOne<ItemRow, Item>(
    `SELECT id, name, description, created_at, updated_at
     FROM items
     WHERE id = :id`,
    mapRowToItem,
    { id }
  );
}

export async function createItem(data: CreateItem): Promise<Item> {
  const result = await query<ItemRow>(
    `INSERT INTO items (name, description, created_at, updated_at)
     VALUES (:name, :description, NOW(), NOW())
     RETURNING id, name, description, created_at, updated_at`,
    {
      name: data.name,
      description: data.description ?? null,
    }
  );
  return mapRowToItem(result.rows[0]);
}

export async function updateItem(data: UpdateItem): Promise<Item | null> {
  const current = await getItemById(data.id);
  if (!current) {
    return null;
  }

  const result = await query<ItemRow>(
    `UPDATE items
     SET name = :name,
         description = :description,
         updated_at = NOW()
     WHERE id = :id
     RETURNING id, name, description, created_at, updated_at`,
    {
      id: data.id,
      name: data.name ?? current.name,
      description: data.description !== undefined ? data.description : current.description,
    }
  );
  return result.rows[0] ? mapRowToItem(result.rows[0]) : null;
}

export async function deleteItem(id: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM items WHERE id = :id`,
    { id }
  );
  return result.rowCount > 0;
}
