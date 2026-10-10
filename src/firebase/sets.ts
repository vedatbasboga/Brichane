// Setlerin Firestore erişim katmanı. Silme yok; arşivleme `archived` alanıyla.

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import type { NewSetInput, SavedSet } from '../data/savedSet'
import { db } from './app'

const SETS = 'sets'
const BOARD_NOTES = 'boardNotes'
const LIST_LIMIT = 500

const setsCollection = collection(db, SETS)

function toDate(value: unknown): Date | null {
  return value ? (value as Timestamp).toDate() : null
}

function fromSnapshot(snap: DocumentSnapshot): SavedSet {
  const data = snap.data() ?? {}
  return {
    id: snap.id,
    title: data.title,
    topicId: data.topicId,
    topicName: data.topicName,
    recipe: data.recipe,
    seed: data.seed,
    count: data.count,
    deals: data.deals ?? [],
    notes: data.notes ?? '',
    dd: data.dd,
    par: data.par,
    archived: data.archived === true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export async function createSet(input: NewSetInput): Promise<string> {
  const ref = await addDoc(setsCollection, {
    ...input,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** En yeni önce. */
export async function listSets(): Promise<SavedSet[]> {
  const snap = await getDocs(query(setsCollection, orderBy('createdAt', 'desc'), limit(LIST_LIMIT)))
  return snap.docs.map(fromSnapshot)
}

export async function getSet(id: string): Promise<SavedSet | null> {
  const snap = await getDoc(doc(db, SETS, id))
  return snap.exists() ? fromSnapshot(snap) : null
}

export async function updateSet(
  set: Pick<SavedSet, 'id' | 'title' | 'notes' | 'archived'>,
): Promise<void> {
  await updateDoc(doc(db, SETS, set.id), {
    title: set.title,
    notes: set.notes,
    archived: set.archived,
    updatedAt: serverTimestamp(),
  })
}

/** Çift kukla sonuçlarını sete bir kez yazar (kurallar yalnızca henüz yoksa izin verir). */
export async function saveSetDd(id: string, dd: Required<Pick<SavedSet, 'dd' | 'par'>>) {
  await updateDoc(doc(db, SETS, id), { dd: dd.dd, par: dd.par, updatedAt: serverTimestamp() })
}

/** Board numarası → not metni. */
export async function loadBoardNotes(setId: string): Promise<Record<number, string>> {
  const snap = await getDocs(collection(db, SETS, setId, BOARD_NOTES))
  const notes: Record<number, string> = {}
  for (const d of snap.docs) notes[Number(d.id)] = d.data().text ?? ''
  return notes
}

export async function saveBoardNote(setId: string, board: number, text: string): Promise<void> {
  await setDoc(doc(db, SETS, setId, BOARD_NOTES, String(board)), {
    text,
    updatedAt: serverTimestamp(),
  })
}

/** Seti ve board notlarını yeni bir sete kopyalar. */
export async function copySet(
  set: SavedSet,
  boardNotes: Record<number, string>,
  title: string,
): Promise<string> {
  const id = await createSet({
    title,
    topicId: set.topicId,
    topicName: set.topicName,
    recipe: set.recipe,
    seed: set.seed,
    count: set.count,
    deals: set.deals,
    notes: set.notes,
    ...(set.dd && set.par ? { dd: set.dd, par: set.par } : {}),
  })
  const entries = Object.entries(boardNotes).filter(([, text]) => text)
  if (entries.length) {
    const batch = writeBatch(db)
    for (const [board, text] of entries) {
      batch.set(doc(db, SETS, id, BOARD_NOTES, board), { text, updatedAt: serverTimestamp() })
    }
    await batch.commit()
  }
  return id
}
