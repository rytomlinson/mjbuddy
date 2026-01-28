/**
 * Import card data from JSON file to database
 * Run with: npx tsx src/importCardData.ts
 *
 * This restores card data from data/cards-YYYY.json
 * WARNING: This will DELETE all existing card data for this year and replace it!
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { initDb, query, closeDb } from './db.js';
import type { PatternGroup, HandExample } from 'common';

config({ path: resolve(import.meta.dirname, '../../.env') });

// Import format - matches export format
interface ExportedHand {
  displayName: string;
  displayPattern: string;
  patternGroups: PatternGroup[];
  isConcealed: boolean;
  points: number;
  notes: string | null;
  examples?: HandExample[];
}

interface ExportedCategory {
  name: string;
  hands: ExportedHand[];
}

interface ExportedCardYear {
  year: number;
  name: string;
  exportedAt: string;
  categories: ExportedCategory[];
}

async function importCardData() {
  // Get year from command line or default to 2025
  const year = parseInt(process.argv[2] || '2025');
  const inputPath = resolve(import.meta.dirname, `../data/cards-${year}.json`);

  if (!existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    console.error('Usage: npx tsx src/importCardData.ts [year]');
    process.exit(1);
  }

  console.log(`Reading ${inputPath}...`);
  const fileContent = readFileSync(inputPath, 'utf-8');
  const importData: ExportedCardYear = JSON.parse(fileContent);

  console.log(`Importing ${importData.name} (${importData.year})`);
  console.log(`Exported at: ${importData.exportedAt}`);
  console.log(`Categories: ${importData.categories.length}`);

  initDb({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mjbuddy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Check if card year exists
    const yearResult = await query<{ id: number }>(
      `SELECT id FROM card_years WHERE year = :year`,
      { year: importData.year }
    );

    let cardYearId: number;

    if (yearResult.rows.length === 0) {
      // Create the card year
      console.log(`Creating card year ${importData.year}...`);
      const createResult = await query<{ id: number }>(
        `INSERT INTO card_years (year, name, is_active)
         VALUES (:year, :name, true)
         RETURNING id`,
        { year: importData.year, name: importData.name }
      );
      cardYearId = createResult.rows[0].id;
    } else {
      cardYearId = yearResult.rows[0].id;
      console.log(`Found existing card year (id: ${cardYearId})`);

      // Delete existing data for this year
      console.log('Deleting existing hands and categories...');

      // Get category IDs for this year
      const categoryIds = await query<{ id: number }>(
        `SELECT id FROM hand_categories WHERE card_year_id = :cardYearId`,
        { cardYearId }
      );

      if (categoryIds.rows.length > 0) {
        const ids = categoryIds.rows.map(r => r.id);
        // Delete hands first (foreign key constraint)
        await query(
          `DELETE FROM card_hands WHERE category_id = ANY(:ids)`,
          { ids }
        );
        // Then delete categories
        await query(
          `DELETE FROM hand_categories WHERE card_year_id = :cardYearId`,
          { cardYearId }
        );
      }
    }

    // Import categories and hands
    let totalHands = 0;
    let categoryOrder = 1;

    for (const category of importData.categories) {
      console.log(`  Importing category: ${category.name}...`);

      // Create category
      const categoryResult = await query<{ id: number }>(
        `INSERT INTO hand_categories (card_year_id, name, display_order)
         VALUES (:cardYearId, :name, :displayOrder)
         RETURNING id`,
        { cardYearId, name: category.name, displayOrder: categoryOrder++ }
      );
      const categoryId = categoryResult.rows[0].id;

      // Create hands
      let handOrder = 1;
      for (const hand of category.hands) {
        await query(
          `INSERT INTO card_hands (
            category_id, display_name, display_pattern, pattern_json,
            is_concealed, points, notes, display_order, examples_json, created_at
          ) VALUES (
            :categoryId, :displayName, :displayPattern, :patternJson,
            :isConcealed, :points, :notes, :displayOrder, :examplesJson, NOW()
          )`,
          {
            categoryId,
            displayName: hand.displayName,
            displayPattern: hand.displayPattern,
            patternJson: JSON.stringify(hand.patternGroups),
            isConcealed: hand.isConcealed,
            points: hand.points,
            notes: hand.notes,
            displayOrder: handOrder++,
            examplesJson: hand.examples ? JSON.stringify(hand.examples) : null,
          }
        );
        totalHands++;
      }

      console.log(`    ${category.hands.length} hands imported`);
    }

    console.log(`\nImport complete! ${totalHands} hands imported.`);

  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

importCardData().catch(console.error);
