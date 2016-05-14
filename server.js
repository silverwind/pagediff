#!/usr/bin/env node
"use strict";

const fs = require("fs");
const join = require("path").join;
const express = require("express");
const app = express();
const Pageres = require("pageres");
const resemble = require("node-resemble-js");
const slugify = require("slugify-url");

const client = join(__dirname, "client");
const img = join(__dirname, "img");

resemble.outputSettings({
  errorColor: {red: 255, green: 0, blue: 0},
  errorType: "movement",
  transparency: 0.25,
  largeImageThreshold: 0
});

function imgPath(name) { return join(img, slugify(name)) + ".png"; }
function imgUrl(name) { return "img/" + slugify(name) + ".png"; }

app.use(require("body-parser").json());
app.use("/", express.static(client, {maxAge: 0}));
app.use("/img", express.static(img, {maxAge: 0}));

app.post("/diff", function(req, res) {
  var a = req.body.a, b = req.body.b;
  new Pageres({delay: 2, crop: true, filename: "<%= url %>"})
  .src(a, ["1366x768"]).src(b, ["1366x768"]).dest(img).run()
  .then(function() {
    getDiff(a, b).then(function(diff) {
      res.json({
        err: null,
        a: imgUrl(a),
        b: imgUrl(b),
        diff: imgUrl(a + "-" + b),
        perc: diff.perc,
      });
    });
  }).catch(function(err) {
    res.json({err: err});
  });
});

const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", function() {
  console.log("pagediff server listening on: http://localhost:" + port);
});

function getDiff(a, b) {
  return new Promise(function(resolve) {
    fs.readFile(imgPath(a), function(_, aData) {
      fs.readFile(imgPath(b), function(_, bData) {
        resemble(aData).compareTo(bData).ignoreColors().onComplete(function(data) {
          data.getDiffImage().pack().pipe(fs.createWriteStream(imgPath(a + "-" + b)));
          resolve({perc: data.misMatchPercentage});
        });
      });
    });
  });
}
