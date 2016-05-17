#!/usr/bin/env node
"use strict";

process.title = "pagediff";

const join = require("path").join;
const express = require("express");
const app = express();
const Pageres = require("pageres");
const bd = require("blink-diff");
const slugify = require("slugify-url");

const client = join(__dirname, "client");
const img = join(__dirname, "img");
const port = process.env.PORT || 4000;

function imgPath(name) { return join(img, slugify(name)) + ".png"; }
function imgUrl(name) { return "img/" + slugify(name) + ".png"; }

app.use(require("body-parser").json());
app.use("/", express.static(client, {maxAge: 0}));
app.use("/img", express.static(img, {maxAge: 0}));

app.post("/diff", (req, res) => {
  const a = req.body.a, b = req.body.b, dims = req.body.w + "x" + req.body.h;
  new Pageres({delay: 1, crop: false, filename: "<%= url %>"})
  .src(a, [dims]).src(b, [dims]).dest(img).run().then(() => getDiff(a, b)).then(perc => {
    res.json({
      a: imgUrl(a),
      b: imgUrl(b),
      diff: imgUrl(a + "-" + b),
      perc: perc,
    });
  }).catch(err => {
    console.error(err);
    res.json({err: err});
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log("pagediff server listening on: http://localhost:" + port);
});

function getDiff(a, b) {
  return new Promise((resolve, reject) => {
    (new bd({
      imageAPath: imgPath(a),
      imageBPath: imgPath(b),
      imageOutputPath: imgPath(a + "-" + b),
      outputBackgroundBlue: 255,
      outputBackgroundGreen: 255,
      outputBackgroundOpacity: .85,
      outputBackgroundRed: 255,
      composition: false,
      delta: 0,
      threshold: 0,
    })).run((err, res) => {
      if (err) return reject(err);
      resolve(Math.round((res.differences / res.dimension) * 1e4) / 1e2);
    });
  });
}
