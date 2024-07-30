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
  context?: Array<{ sentence: string; translation: string, isBad: boolean }>;
  history?: Array<{ date: Date; contextId: number; success: boolean }>;
}

export class Database {
  private db: SQLite.SQLiteDatabase | null = null;
  initialized:boolean = false;
  private static instance: Database;

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("Database already initialized");
      return;
    }

    try {
      console.log("Initializing database");
      this.db = await SQLite.openDatabaseAsync('myAppDatabase.db');
      await this.createTables();
      this.initialized = true;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  
  async SafeOperation(): Promise<void>{
    if (!this.initialized)
    {
      await this.initialize();
    }
  }

  async createTables(): Promise<void> {
    
    //await this.SafeOperation();
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
    
      CREATE TABLE IF NOT EXISTS contexts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sentence TEXT NOT NULL,
        translation TEXT NOT NULL,
        cardId INTEGER NOT NULL,
        isBad BOOL NOT NULL,
        FOREIGN KEY (cardId) REFERENCES cards(id)
      );
    `);
    
  }

  async insertCard(card: Card): Promise<number> {
    
    //await this.SafeOperation();
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
    console.log("First part success")
    if (card.context == null){
      return result.lastInsertRowId;
    }
    for (let context of card.context) {
      console.log("Inserting context:", context);
      try {
        const resultContext = await this.db.runAsync(
          `INSERT INTO contexts (sentence, translation, cardId)
           VALUES (?, ?, ?)`,
          [
            context.sentence,
            context.translation,
            result.lastInsertRowId
          ]
        );
        console.log("Context inserted successfully");
      } catch (error) {
        console.error("Error inserting context:", error);
        throw error; 
      }
    }
    

    return result.lastInsertRowId;
  }

  async getCardById(id: number): Promise<Card | null> {
    
    //await this.SafeOperation();
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

    await this.SafeOperation();
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');
  
    const query = `
      SELECT 
        c.id, c.word, c.translations, c.lastRepeat, c.level, c.userId, 
        c.source, c.sourceLanguage, c.targetLanguage,
        ctx.id as contextId, ctx.sentence, ctx.translation
      FROM cards c
      LEFT JOIN contexts ctx ON c.id = ctx.cardId
      ORDER BY c.lastRepeat DESC
    `;
  
    const results = await this.db.getAllAsync<any>(query);
  
    // Group the results by card
    const cardMap = new Map<number, Card>();
  
    for (const row of results) {
      if (!cardMap.has(row.id)) {
        cardMap.set(row.id, {
          id: row.id,
          word: row.word,
          translations: JSON.parse(row.translations),
          lastRepeat: new Date(row.lastRepeat),
          level: row.level,
          userId: row.userId,
          source: row.source,
          sourceLanguage: row.sourceLanguage,
          targetLanguage: row.targetLanguage,
          context: []
        });
      }
  
      const card = cardMap.get(row.id)!;
  
      if (row.contextId) {
        card.context!.push({
          sentence: row.sentence,
          translation: row.translation,
          isBad: false
        });
      }
    }
  
    return Array.from(cardMap.values());
  }

  async updateCard(card: Card): Promise<void> {

    console.log("Trying to update");
    //await this.SafeOperation();
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    try {
      let result = await this.db.runAsync(
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
          card.targetLanguage,
          card.id ?? 0
        ]
        
      );
      //console.log("card updated:", {card})
      //console.log("result updated:", {result})


    }
    catch(error){
      console.log(error)
    }
  }

  async deleteCard(id: number): Promise<void> {

    //await this.SafeOperation();
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');

    await this.db.runAsync('DELETE FROM cards WHERE id = ?', id);
  }
}

// Export a single instance of the Database class
export const database = new Database();