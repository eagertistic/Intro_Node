import fs from "node:fs/promises";

const DB_PATH = new URL("../db.json", import.meta.url).pathname;

export const getDB = async () => {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
};

export const saveDB = async (data) => {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  return data;
};

export const insertNote = async (note) => {
  const data = await getDB();
  data.notes.push(note);
  await saveDB(data);
  return note;
};



