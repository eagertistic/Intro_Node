import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import pg from "pg";
const { Pool } = pg;
import { listNotes } from "./utils.js";
import { start } from "./server.js";

const pool = new Pool({
  user: "unknown",
  password: "mysecretpassword",
  host: "localhost",
  port: 5432,
  database: "my_notes",
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

yargs(hideBin(process.argv))
  .command(
    "new <note>",
    "create a new note",
    (yargs) => {
      yargs.positional("note", {
        type: "string",
        description: "The content of the note to create",
      });
    },
    async (argv) => {
      try {
        await pool.query("INSERT INTO notes (content, tags) VALUES ($1, $2)", [
          argv.note,
          argv.tags ? argv.tags.split(",") : [],
        ]);

        console.log(`The note you've created: ${argv.note}`);
      } finally {
        await pool.end();
      }
    },
  )
  .option("tags", {
    alias: "t",
    type: "string",
    description: "tags to add to the note",
  })
  .command(
    "all",
    "get all notes",
    () => {},
    async (argv) => {
      try {
        let response;
        if (argv.tags) {
          response = await pool.query(
            "SELECT * FROM notes WHERE ($1::text is null OR tags && $1::text[])",
            [argv.tags ? argv.tags.split(",") : []],
          );
          listNotes(response.rows);
        } else {
          response = await pool.query("SELECT * FROM notes");
          listNotes(response.rows);
        }
      } finally {
        await pool.end();
      }
    },
  )
  .option("tags", {
    alias: "t",
    type: "string",
    description: "get all notes that match the tags",
  })
  .command(
    "find <filter>",
    "get matching notes",
    (yargs) => {
      return yargs.positional("filter", {
        describe:
          "The search term to filter notes by, will be applied to note.content",
        type: "string",
      });
    },
    async (argv) => {
      let response;
      try {
        response = await pool.query(
          "SELECT * FROM notes WHERE content ILIKE $1",
          [`%${argv.filter}%`],
        );
        listNotes(response.rows);
      } finally {
        await pool.end();
      }
    },
  )
  .command(
    "remove <id>",
    "remove a note by id",
    (yargs) => {
      return yargs.positional("id", {
        type: "number",
        description: "The id of the note you want to remove",
      });
    },
    async (argv) => {
      let response;
      try {
        response = await pool.query(
          "DELETE FROM notes WHERE id = $1 returning content",
          [argv.id],
        );
        console.log(`The note you've deleted is: ${response.rows[0].content}`);
      } catch {
        console.error(
          `DELETE FAILED: The id ${argv.id} doesn't match with the records, consider try again!`,
        );
      } finally {
        await pool.end();
      }
    },
  )
  .command(
    "web [port]",
    "launch website to see notes",
    (yargs) => {
      return yargs.positional("port", {
        describe: "port to bind on",
        default: 5000,
        type: "number",
      });
    },
    async (argv) => {
      try {
        let response = await pool.query("SELECT content, tags FROM notes");
        start(response.rows, argv.port);
      } finally {
        await pool.end();
      }
    },
  )
  .command(
    "clean",
    "remove all notes",
    () => {},
    async () => {
      try {
        await pool.query("TRUNCATE TABLE notes RESTART IDENTITY");
        console.log("All notes removed");
      } finally {
        await pool.end();
      }
    },
  )
  .demandCommand(1)
  .strict()
  .parse();
