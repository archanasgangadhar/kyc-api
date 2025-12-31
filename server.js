const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes/employee.routes");

const app = express();

app.use(cors());
app.use(express.json()); // ✅ REQUIRED for POST/PUT APIs

app.use("/api/employees", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});