const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));

// Only start server if NOT running in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => console.log("Server running on 3000"));
}

module.exports = app;
