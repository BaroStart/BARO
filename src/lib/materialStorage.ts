/**
 * 학습 자료 로컬 저장소 (IndexedDB + localStorage)
 * 백엔드 API 연동 전까지 클라이언트에서 파일 저장
 */

const DB_NAME = 'blaybus-materials';
const DB_VERSION = 1;
const STORE_NAME = 'files';
const META_KEY = 'materials-meta';

export interface MaterialMeta {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'image' | 'document' | 'other';
  subject: string;
  subCategory: string;
  uploadedAt: string;
  source: 'seolstudy' | 'mentor';
  fileUrl?: string;
}

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveMaterial(meta: MaterialMeta, file: File): Promise<void> {
  const database = await openDB();
  const blob = await file.arrayBuffer();

  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: meta.id, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  const metaList = getMaterialsMeta();
  metaList.unshift(meta);
  localStorage.setItem(META_KEY, JSON.stringify(metaList));
}

export function getMaterialsMeta(): MaterialMeta[] {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getMaterialBlob(id: string): Promise<Blob | null> {
  const database = await openDB();
  return new Promise((resolve) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      const row = req.result;
      resolve(row?.blob ? new Blob([row.blob]) : null);
    };
    req.onerror = () => resolve(null);
  });
}

export function deleteMaterial(id: string): Promise<void> {
  return openDB().then((database) => {
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => {
        const metaList = getMaterialsMeta().filter((m) => m.id !== id);
        localStorage.setItem(META_KEY, JSON.stringify(metaList));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  });
}

export function getAllMaterials(): MaterialMeta[] {
  const stored = getMaterialsMeta();
  return stored;
}

export function getSeolstudyMaterials(): MaterialMeta[] {
  const mockMaterials: MaterialMeta[] = [
    {
      id: 'mat1',
      title: '2025 수능특강 비문학.pdf',
      fileName: '2025 수능특강 비문학.pdf',
      fileSize: '2.4 MB',
      fileType: 'pdf',
      subject: '국어',
      subCategory: '비문학',
      uploadedAt: '2025-01-01',
      source: 'seolstudy',
    },
    {
      id: 'mat2',
      title: '문학 감상문 작성법.pdf',
      fileName: '문학 감상문 작성법.pdf',
      fileSize: '1.2 MB',
      fileType: 'pdf',
      subject: '국어',
      subCategory: '문학',
      uploadedAt: '2025-01-01',
      source: 'seolstudy',
    },
    {
      id: 'mat3',
      title: '2025 수능특강 영어독해.pdf',
      fileName: '2025 수능특강 영어독해.pdf',
      fileSize: '2.4 MB',
      fileType: 'pdf',
      subject: '영어',
      subCategory: '독해/듣기/어휘',
      uploadedAt: '2025-01-01',
      source: 'seolstudy',
    },
    {
      id: 'mat4',
      title: '영어 독해 학습 가이드.pdf',
      fileName: '영어 독해 학습 가이드.pdf',
      fileSize: '0.8 MB',
      fileType: 'pdf',
      subject: '영어',
      subCategory: '독해/듣기/어휘',
      uploadedAt: '2025-01-01',
      source: 'seolstudy',
    },
    {
      id: 'mat5',
      title: '수능 필수 영단어 50.pdf',
      fileName: '수능 필수 영단어 50.pdf',
      fileSize: '0.5 MB',
      fileType: 'pdf',
      subject: '영어',
      subCategory: '독해/듣기/어휘',
      uploadedAt: '2025-01-01',
      source: 'seolstudy',
    },
    {
      id: 'mat6',
      title: 'EBS 수능완성 수학.pdf',
      fileName: 'EBS 수능완성 수학.pdf',
      fileSize: '3.1 MB',
      fileType: 'pdf',
      subject: '수학',
      subCategory: '미적분',
      uploadedAt: '2025-01-01',
      source: 'seolstudy',
    },
    {
      id: 'mat7',
      title: '기하 벡터 연습문제.pdf',
      fileName: '기하 벡터 연습문제.pdf',
      fileSize: '1.5 MB',
      fileType: 'pdf',
      subject: '수학',
      subCategory: '기하',
      uploadedAt: '2025-01-01',
      source: 'seolstudy',
    },
  ];
  return mockMaterials;
}

export function initializeSeolstudyMaterials(): void {
  const stored = getMaterialsMeta();
  const seolstudyMaterials = getSeolstudyMaterials();

  const hasSeolstudy = stored.some((m) => m.source === 'seolstudy');
  if (hasSeolstudy) return;

  const merged = [...seolstudyMaterials, ...stored];
  localStorage.setItem(META_KEY, JSON.stringify(merged));
}
