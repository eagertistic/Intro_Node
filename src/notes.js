import { insertDB, saveDB, getDB } from "./db.js";

export const newNote = async (note, tags) => {
  const newNote = {
    tags,
    id: Date.now().toLocaleString("en-GB", { timeZone: "UTC" }),
    content: note,
  };
  await insertDB(newNote);
  return newNote;
};

export const getAllNotes = async () => {
  const { notes } = await getDB();
  return notes;
};

export const findNote = async (keyword) => {
  const { notes } = await getAllNotes();
  const filtered_notes = notes.filter((note) => {
    note.content.toLowerCase().includes(keyword.toLowerCase());
  });
  return filtered_notes;
};

export const removeNote = async (id) => {
  const { notes } = await getAllNotes();
  const match = notes.find((note) => {
    note.id === id;
  });

  if (match) {
    const updatedNotes = notes.filter((note) => {
      note.id !== id;
    });
    await saveDB({ notes: updatedNotes });
    return id;
  }
};

export const removeAllNotes = async () => {
  await saveDB({ notes: [] });
};
