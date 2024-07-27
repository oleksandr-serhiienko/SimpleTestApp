// import * as SQLite from 'expo-sqlite';

// class DatabaseWrapper {
//   private db: SQLite.SQLiteDatabase | null = null;

//   async openDatabase(name: string): Promise<void> {
//     this.db = await SQLite.openDatabaseAsync(name);
//   }

//   async runAsync(sql: string, params: any[] = []): Promise<SQLite.SQLiteExecuteSyncResult> {
//     if (!this.db) {
//       throw new Error('Database not opened. Call openDatabase first.');
//     }
//     return new Promise((resolve, reject) => {
//       this.db!.execAsync([{ sql, args: params }], false, (error, resultSet) => {
//         if (error) reject(error);
//         else resolve(resultSet[0]);
//       });
//     });
//   }

//   async getAsync<T>(sql: string, params: any[] = []): Promise<T | undefined> {
//     const result = await this.runAsync(sql, params);
//     return result.rows.length > 0 ? result.rows.item(0) as T : undefined;
//   }

//   async allAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
//     const result = await this.runAsync(sql, params);
//     return result.rows._array as T[];
//   }
// }

// const database = new DatabaseWrapper();

// export default database;