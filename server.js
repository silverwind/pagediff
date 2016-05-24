#!/usr/bin/env node
"use strict";

process.title = "pagediff";

const pagediff = require(".");
const join = require("path").join;
const express = require("express");
const app = express();

const client = join(__dirname, "client");
const img = join(__dirname, "img");
const port = process.env.PORT || 4000;

app.use(require("body-parser").json());
app.use("/", express.static(client, {maxAge: 0}));
app.use("/img", express.static(img, {maxAge: 0}));

app.post("/diff", (req, res) => {
  pagediff(req.body.a, req.body.b, req.body.w, req.body.h, 6).then(function(result) {
    res.json(result);
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log("pagediff server listening on: http://localhost:" + port);
});
