const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,

  pool: {
    max: 10,          // 🔥 max concurrent connections
    min: 0,
    idleTimeoutMillis: 30000
  },

  options: {
    encrypt: true,                // set true for Azure
    trustServerCertificate: true   // local / self-signed cert
  }
};

let pool; // 🔥 singleton pool

const getPool = async () => {
  try {
    if (pool) {
      return pool; // reuse existing pool
    }

    pool = await sql.connect(config);
    console.log("✅ SQL Server connected (pool created)");
    return pool;

  } catch (err) {
    console.error("❌ Database connection failed", err);
    throw err;
  }
};

module.exports = getPool;