export type SavedArticle = {
  id: string;
  kind: 'lesson' | 'exam' | 'slide' | 'skkn';
  title: string;
  createdAt: string;
  input: Record<string, unknown>;
  result: string;
  warnings?: string[];
};

export type TextbookNote = {
  id: string;
  grade: number;
  subject: string;
  book: string;
  type: 'book' | 'lesson';
  title: string;
  summary: string;
  sourceText: string;
  sourceUrl: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
  updatedAt: string;
};

const databaseName = 'teacher-ai-local';
const databaseVersion = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('articles')) db.createObjectStore('articles', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('textbookNotes')) db.createObjectStore('textbookNotes', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transact<T>(storeName: 'articles' | 'textbookNotes', mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = run(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

export async function saveArticle(article: SavedArticle) { await transact('articles', 'readwrite', store => store.put(article)); }
export async function deleteArticle(id: string) { await transact('articles', 'readwrite', store => store.delete(id)); }
export async function listArticles(): Promise<SavedArticle[]> {
  const rows = await transact<SavedArticle[]>('articles', 'readonly', store => store.getAll());
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveTextbookNote(note: TextbookNote) { await transact('textbookNotes', 'readwrite', store => store.put(note)); }
export async function deleteTextbookNote(id: string) { await transact('textbookNotes', 'readwrite', store => store.delete(id)); }
export async function listTextbookNotes(): Promise<TextbookNote[]> {
  const rows = await transact<TextbookNote[]>('textbookNotes', 'readonly', store => store.getAll());
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
