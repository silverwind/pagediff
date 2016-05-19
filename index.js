"use strict";

const join = require("path").join;
const fs = require("fs");
const screenshotStream = require("screenshot-stream");
const protocolify = require("protocolify");
const blink = require("blink-diff");
const slugify = require("slugify-url");
const ImageJS = require("imagejs");

const img = join(__dirname, "img");
try { fs.mkdirSync(img); } catch (e) {}

function imgPath(name) { return join(img, slugify(name)) + ".png"; }
function imgUrl(name) { return "img/" + slugify(name) + ".png"; }

module.exports = function pagediff(a, b, w, h, delay) {
  return new Promise(function(resolve, reject) {
    createScreenshot(a, w, h, delay).then(() => createScreenshot(b, w, h, delay)).then(function() {
      return new Promise((resolve, reject) => {
        try {
          (new blink({
            imageAPath: imgPath(a),
            imageBPath: imgPath(b),
            imageOutputPath: imgPath(a + "-" + b),
            outputBackgroundBlue: 255,
            outputBackgroundGreen: 255,
            outputBackgroundRed: 255,
            outputBackgroundOpacity: .85,
            composition: false,
            delta: 0,
            threshold: 0,
            hShift: 0,
            vShift: 0,
          })).run((err, res) => {
            if (err) return reject(err);
            resolve(Math.round((res.differences / res.dimension) * 1e4) / 1e2);
          });
        } catch (err) {
          // blink-diff does async throws ಠ_ಠ
          createBlank(imgPath(a + "-" + b), w, h).then(resolve);
        }
      });
    }).then(perc => {
      resolve({
        a: imgUrl(a),
        b: imgUrl(b),
        diff: imgUrl(a + "-" + b),
        perc: perc,
      });
    }).catch(err => {
      reject({err: err});
    });
  });
};

function createScreenshot(name, w, h, delay) {
  return new Promise(function(resolve) {
    var opts = {crop: true, delay: delay, timeout: delay + 2};
    var input = screenshotStream(protocolify(name), w + "x" + h, opts);
    var output = fs.createWriteStream(imgPath(name));
    input.pipe(output);
    input.on("finish", resolve);
    input.on("error", error);
    output.on("error", error);
    function error() {
      input.unpipe(output);
      output.end(function() {
        createBlank(imgPath(name), w, h).then(resolve);
      });
    }
  });
}

function createBlank(path, w, h) {
  return new Promise(function(resolve) {
    var bitmap = new ImageJS.Bitmap({width: w, height: h, color: {r: 255, g: 255, b: 255, a: 255}});
    bitmap.write(fs.createWriteStream(path), {type: ImageJS.ImageType.PNG}).then(resolve);
  });
}
