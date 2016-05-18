#!/usr/bin/env node
"use strict";

process.title = "pagediff";

const join = require("path").join;
const fs = require("fs");
const Pageres = require("pageres");
const bd = require("blink-diff");
const slugify = require("slugify-url");
const ImageJS = require("imagejs");

const img = join(__dirname, "img");
function imgPath(name) { return join(img, slugify(name)) + ".png"; }
function imgUrl(name) { return "img/" + slugify(name) + ".png"; }

module.exports = function pagediff(a, b, w, h) {
  return new Promise(function(resolve, reject) {
    const dims = w + "x" + h;
    Promise.all([
      new Pageres({delay: 1, crop: true, filename: slugify(a)}).src(a, [dims]).dest(img).run().catch(function() {
        return createBlankPng(imgPath(a), w, h);
      }),
      new Pageres({delay: 1, crop: true, filename: slugify(b)}).src(b, [dims]).dest(img).run().catch(function() {
        return createBlankPng(imgPath(a), w, h);
      }),
    ]).then(function() {
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
    }).then(perc => {
      resolve({
        a: imgUrl(a),
        b: imgUrl(b),
        diff: imgUrl(a + "-" + b),
        perc: perc,
      });
    }).catch(err => {
      console.error(err);
      reject({err: err});
    });
  });
};

function createBlankPng(path, w, h) {
  return new Promise(function(resolve) {
    var ws = fs.createWriteStream(path);
    var bitmap = new ImageJS.Bitmap({width: w, height: h, color: {r: 255, g: 255, b: 255, a: 255}});
    bitmap.write(ws, {type: ImageJS.ImageType.PNG}).then(resolve);
  });
}
