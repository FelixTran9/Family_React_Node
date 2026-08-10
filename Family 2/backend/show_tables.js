import pool from "./src/config/db.js";

async function showTables() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    console.log("Tables:");
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

showTables();
