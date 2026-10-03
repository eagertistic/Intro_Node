import http from "node:http";
import open from "open";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  password: "mysecretpassword",
  host: "localhost",
  port: 5432,
  database: "postgres",
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const interpolate = (html, data) => {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, placeholder) => {
    return data[placeholder] || "";
  });
};

const notes = [
  {
    content: "hello",
    tags: ["test1"],
  },
  {
    content: "hello2",
    tags: ["test2", "test3"],
  },
];

const formNotes = (notes) => {
  return notes
    .map((note) => {
      return `
    <div class="note">
      <p> ${note.content} </p>
      <div class="tags">
        ${note.tags.map((tag) => `<span class = 'tag'>${tag}</span>`).join("")}
      </div>
    </div>`;
    })
    .join("");
};

console.log(formNotes(notes));
