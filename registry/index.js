const express = require("express");
const app = express();
const body = require("body-parser");
const fs = require("fs");
const path = require("path");
const serveIndex = require("serve-index");

app.use(body.raw({ type: "*/*" }));

app.use("/index", serveIndex(path.join(__dirname, "repo")));
app.get("/health", (req, res) => {
  res.json({ message: "maybe good" });
});

app.get("/repo/:idx/:name", (req, res) => {
  const { idx, name } = req.params;
  const filePath = path.join(__dirname, "repo", `${idx}_${name}.json`);
  res.sendFile(filePath);
});

app.put("/repo/:idx/:name", (req, res) => {
  const { idx, name } = req.params;
  const filePath = path.join(__dirname, "repo", `${idx}_${name}.json`);
  fs.writeFile(filePath, req.body, (err) => {
    if (err) throw err;
    res.end();
  });
});

module.exports = {
  path: "/registry",
  handler: app,
};
