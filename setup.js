const sql = require("mssql");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function setupDatabase() {
  try {
    const pool = await sql.connect(config);
    const sqlScript = fs.readFileSync(path.join(__dirname, "sql", "employee_tables.sql"), "utf8");
    const queries = sqlScript.split(";").filter(q => q.trim().length > 0);
    for (const query of queries) {
      if (query.trim()) {
        await pool.request().query(query);
      }
    }
    console.log("Database tables created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error setting up database:", err);
    process.exit(1);
  }
}

setupDatabase();