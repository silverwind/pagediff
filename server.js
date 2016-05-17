#!/usr/bin/env node
"use strict";

const fs = require("fs");
const join = require("path").join;
const express = require("express");
const app = express();
const Pageres = require("pageres");
const bd = require("blink-diff");
const slugify = require("slugify-url");

const client = join(__dirname, "client");
const img = join(__dirname, "img");

function imgPath(name) { return join(img, slugify(name)) + ".png"; }
function imgUrl(name) { return "img/" + slugify(name) + ".png"; }

app.use(require("body-parser").json());
app.use("/", express.static(client, {maxAge: 0}));
app.use("/img", express.static(img, {maxAge: 0}));

app.post("/diff", function(req, res) {
  var a = req.body.a, b = req.body.b;
  var dims = req.body.w + "x" + req.body.h;
  new Pageres({delay: 1, crop: false, filename: "<%= url %>"})
  .src(a, [dims]).src(b, [dims]).dest(img).run()
  .then(function() {
    getDiff(a, b).then(function(perc) {
      res.json({
        err: null,
        a: imgUrl(a),
        b: imgUrl(b),
        diff: imgUrl(a + "-" + b),
        perc: perc,
      });
    });
  }).catch(function(err) {
    console.error(err);
    res.json({err: err});
  });
});

const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", function() {
  console.log("pagediff server listening on: http://localhost:" + port);
});

function getDiff(a, b) {
  return new Promise(function(resolve) {
    (new bd({
      imageAPath: imgPath(a),
      imageBPath: imgPath(b),
      imageOutputPath: imgPath(a + "-" + b),
      threshold: 0,
      composition: false,
      delta: 0,
      outputBackgroundRed: 255,
      outputBackgroundGreen: 255,
      outputBackgroundBlue: 255,
      outputBackgroundOpacity: .85,
    })).run(function(_, res) {
      resolve(Math.round((res.differences / res.dimension) * 1e4) / 1e2);
    });
  });
}
