// note.middleware.ts

const BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_DEV_BASE_URL
  : import.meta.env.VITE_API_PROD_BASE_URL;

async function getBaseUrl() {
  return BASE_URL;
}

export type Note = {
  _id?: string;
  realEstateQuery: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NoteUpdate = Partial<Pick<Note, "note">>;

export async function getAllNotesByQueryId(realEstateQueryId: string) {
  try {
    const url = await getBaseUrl();

    const response = await fetch(
      `${url}/api/notes/query/${encodeURIComponent(realEstateQueryId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "GET",
      }
    );

    if (response.ok) {
      const notes = await response.json();
      return notes;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function createNote(protoNote: Note) {
  try {
    const url = await getBaseUrl();

    const response = await fetch(`${url}/api/notes`, {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify(protoNote),
    });

    if (response.ok) {
      const createdNote = await response.json();
      return createdNote;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function updateNote(noteId: string, updates: NoteUpdate) {
  try {
    const url = await getBaseUrl();

    const response = await fetch(
      `${url}/api/notes/${encodeURIComponent(noteId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );

    if (response.ok) {
      const updatedNote = await response.json();
      return updatedNote;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function deleteNote(noteId: string) {
  try {
    const url = await getBaseUrl();

    const response = await fetch(
      `${url}/api/notes/${encodeURIComponent(noteId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "DELETE",
      }
    );

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

