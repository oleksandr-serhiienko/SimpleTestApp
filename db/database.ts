import * as SQLite from 'expo-sqlite';

export interface Card {
  id?: number;
  word: string;
  translations: string[];
  lastRepeat: Date;
  level: number;
  userId: string;
  source: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: Array<{ sentence: string; translation: string }>;
  history?: Array<{ date: string; contextId: number; success: boolean }>;
}

export class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('myAppDatabase.db');
    await this.createTables()
  }

  async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');
    
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        translations TEXT NOT NULL,
        lastRepeat DATETIME NOT NULL,
        level INTEGER NOT NULL,
        userId TEXT NOT NULL,
        source TEXT NOT NULL,
        sourceLanguage TEXT NOT NULL,
        targetLanguage TEXT NOT NULL
      );
    `);
  }

  async insertCard(card: Card): Promise<number> {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    const result = await this.db.runAsync(
      `INSERT INTO cards (word, translations, lastRepeat, level, userId, source, sourceLanguage, targetLanguage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.word,
        JSON.stringify(card.translations),
        card.lastRepeat.toISOString(),
        card.level,
        card.userId,
        card.source,
        card.sourceLanguage,
        card.targetLanguage
      ]
    );
    return result.lastInsertRowId;
  }

  async getCardById(id: number): Promise<Card | null> {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    const card = await this.db.getFirstAsync<any>('SELECT * FROM cards WHERE id = ?', id);
    if (!card) return null;

    return {
      ...card,
      translations: JSON.parse(card.translations),
      lastRepeat: new Date(card.lastRepeat)
    };
  }

  async getAllCards(): Promise<Card[]> {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    const cards = await this.db.getAllAsync<any>('SELECT * FROM cards');
    return cards.map(card => ({
      ...card,
      translations: JSON.parse(card.translations),
      lastRepeat: new Date(card.lastRepeat)
    }));
  }

  async updateCard(card: Card): Promise<void> {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    await this.db.runAsync(
      `UPDATE cards SET 
        word = ?, translations = ?, lastRepeat = ?, level = ?, 
        userId = ?, source = ?, sourceLanguage = ?, targetLanguage = ?
       WHERE id = ?`,
      [
        card.word,
        JSON.stringify(card.translations),
        card.lastRepeat.toISOString(),
        card.level,
        card.userId,
        card.source,
        card.sourceLanguage,
        card.targetLanguage
      ]
    );
  }

  async deleteCard(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    await this.db.runAsync('DELETE FROM cards WHERE id = ?', id);
  }
}

// Export a single instance of the Database class
export const database = new Database();