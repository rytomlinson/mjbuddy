/**
 * Export card data from database to JSON file
 * Run with: npx tsx src/exportCardData.ts
 *
 * This creates/updates data/cards-2025.json which should be committed to source control.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { initDb, query, closeDb } from './db.js';
import type { PatternGroup, HandExample } from 'common';

config({ path: resolve(import.meta.dirname, '../../.env') });

interface CategoryRow {
  id: number;
  card_year_id: number;
  name: string;
  display_order: number;
}

interface HandRow {
  id: number;
  category_id: number;
  display_name: string;
  display_pattern: string;
  pattern_json: PatternGroup[];
  is_concealed: boolean;
  points: number;
  notes: string | null;
  display_order: number;
  examples_json: HandExample[] | null;
}

interface CardYearRow {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
}

// Export format - clean JSON structure
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

async function exportCardData() {
  initDb({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mjbuddy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Get active card year
    const yearResult = await query<CardYearRow>(
      `SELECT id, year, name, is_active FROM card_years WHERE is_active = true LIMIT 1`
    );

    if (yearResult.rows.length === 0) {
      console.error('No active card year found');
      return;
    }

    const cardYear = yearResult.rows[0];
    console.log(`Exporting ${cardYear.name} (${cardYear.year})...`);

    // Get all categories for this year
    const categoryResult = await query<CategoryRow>(
      `SELECT id, card_year_id, name, display_order
       FROM hand_categories
       WHERE card_year_id = :cardYearId
       ORDER BY display_order`,
      { cardYearId: cardYear.id }
    );

    console.log(`Found ${categoryResult.rows.length} categories`);

    const exportData: ExportedCardYear = {
      year: cardYear.year,
      name: cardYear.name,
      exportedAt: new Date().toISOString(),
      categories: [],
    };

    let totalHands = 0;

    // Get hands for each category
    for (const category of categoryResult.rows) {
      const handResult = await query<HandRow>(
        `SELECT id, category_id, display_name, display_pattern, pattern_json,
                is_concealed, points, notes, display_order, examples_json
         FROM card_hands
         WHERE category_id = :categoryId
         ORDER BY display_order`,
        { categoryId: category.id }
      );

      const exportedCategory: ExportedCategory = {
        name: category.name,
        hands: handResult.rows.map(hand => {
          const exported: ExportedHand = {
            displayName: hand.display_name,
            displayPattern: hand.display_pattern,
            patternGroups: hand.pattern_json,
            isConcealed: hand.is_concealed,
            points: hand.points,
            notes: hand.notes,
          };
          if (hand.examples_json && hand.examples_json.length > 0) {
            exported.examples = hand.examples_json;
          }
          return exported;
        }),
      };

      exportData.categories.push(exportedCategory);
      totalHands += handResult.rows.length;
      console.log(`  ${category.name}: ${handResult.rows.length} hands`);
    }

    // Write to file
    const dataDir = resolve(import.meta.dirname, '../data');
    mkdirSync(dataDir, { recursive: true });

    const outputPath = resolve(dataDir, `cards-${cardYear.year}.json`);
    writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`\nExported ${totalHands} hands to ${outputPath}`);
    console.log('Remember to commit this file to source control!');

  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

exportCardData().catch(console.error);
