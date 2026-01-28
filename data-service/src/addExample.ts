/**
 * Generate valid examples for ALL card hands from database
 * Run with: npx tsx src/addExample.ts          (test mode - no DB changes)
 * Run with: npx tsx src/addExample.ts --save   (save to database)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { initDb, query, closeDb } from './db.js';
import { generateValidExample } from 'common';
import type { PatternGroup, HandExample } from 'common';

const SAVE_TO_DB = process.argv.includes('--save');

config({ path: resolve(import.meta.dirname, '../../.env') });

// Helper to decode tile code to readable string
function decodeTile(code: number): string {
  const type = (code >> 4);
  const value = code & 0x0f;
  const suitChars: Record<number, string> = { 1: 'D', 2: 'B', 3: 'C' }; // Dot, Bam, Crak
  const windNames: Record<number, string> = { 1: 'E', 2: 'S', 3: 'W', 4: 'N' };
  const dragonNames: Record<number, string> = { 1: 'RD', 2: 'GD', 3: '0' }; // 0 for white dragon

  if (type === 4) return windNames[value] || '?';
  if (type === 5) return dragonNames[value] || 'D';
  if (type === 6) return 'F';
  if (type === 7) return 'J';
  return `${value}${suitChars[type] || '?'}`;
}

interface CardHandRow {
  id: number;
  display_name: string;
  display_pattern: string;
  pattern_json: PatternGroup[];
  category_name: string;
}

async function generateExamples() {
  initDb({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mjbuddy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Ensure the examples_json column exists
    if (SAVE_TO_DB) {
      await query(`
        ALTER TABLE card_hands
        ADD COLUMN IF NOT EXISTS examples_json JSONB
      `);
      console.log('Ensured examples_json column exists.\n');
    }

    // Get all hands with their category names
    const result = await query<CardHandRow>(
      `SELECT ch.id, ch.display_name, ch.display_pattern, ch.pattern_json, hc.name as category_name
       FROM card_hands ch
       JOIN hand_categories hc ON hc.id = ch.category_id
       ORDER BY hc.display_order, ch.display_order`
    );

    const mode = SAVE_TO_DB ? 'SAVE MODE' : 'TEST MODE (use --save to write to DB)';
    console.log(`=== Example Generation for ${result.rows.length} hands [${mode}] ===\n`);

    let currentCategory = '';
    let successCount = 0;
    let warningCount = 0;
    let savedCount = 0;

    for (const hand of result.rows) {
      // Print category header
      if (hand.category_name !== currentCategory) {
        currentCategory = hand.category_name;
        console.log(`\n--- ${currentCategory} ---`);
      }

      try {
        const tiles = generateValidExample(hand.pattern_json);
        const decoded = tiles.map(decodeTile);

        // Group tiles for readability
        let groupedDisplay = '';
        let tileIndex = 0;
        for (const group of hand.pattern_json) {
          const count = group.type;
          const groupTiles = decoded.slice(tileIndex, tileIndex + count);
          groupedDisplay += groupTiles.join('') + ' ';
          tileIndex += count;
        }

        const status = tiles.length === 14 ? '✓' : `⚠️ ${tiles.length}`;
        console.log(`${status} ${hand.display_name}: ${groupedDisplay.trim()}`);

        if (tiles.length === 14) {
          successCount++;

          // Save to database if --save flag is provided
          if (SAVE_TO_DB) {
            const example: HandExample = {
              tiles,
              isValid: true,
            };
            await query(
              `UPDATE card_hands SET examples_json = :examplesJson WHERE id = :id`,
              {
                id: hand.id,
                examplesJson: JSON.stringify([example]),
              }
            );
            savedCount++;
          }
        } else {
          warningCount++;
        }
      } catch (error) {
        console.log(`✗ ${hand.display_name}: ERROR - ${error}`);
        warningCount++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total hands: ${result.rows.length}`);
    console.log(`14-tile hands: ${successCount}`);
    console.log(`Warnings: ${warningCount}`);
    if (SAVE_TO_DB) {
      console.log(`Saved to DB: ${savedCount}`);
    }

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

generateExamples().catch(console.error);
