# pagediff [![](https://img.shields.io/npm/v/@silverwind/pagediff.svg?style=flat)](https://www.npmjs.org/package/@silverwind/pagediff) [![](http://img.shields.io/david/silverwind/pagediff.svg?style=flat)](https://david-dm.org/silverwind/pagediff)
> Visually diff websites

## Preview
![](https://raw.githubusercontent.com/silverwind/pagediff/master/screenshot.png)

## Installation and Usage
```sh
$ git clone git@github.com:silverwind/pagediff.git
$ cd pagediff
$ npm i
$ ./server.js
```

## API
### pagediff(a, b, w, h, delay)
- `a` URL or domain for the first page
- `b` URL or domain for the second page
- `w` width of the generated images
- `h` height of the generated images
- `delay` delay in seconds after which to take the screenshot

Returns a `Promise` that resolves to an object with the following properties:

- `a` path to the first rendered image
- `b` path to the second rendered image
- `diff` path to the diff image
- `perc` percentage of different pixels between images

On error, the Promise will be rejected with:

- `err` Error string and/or stack trace

Go to [`http://localhost:4000`](http://localhost:4000) and enter domains or URLs to compare.

© 2014-2015 [silverwind](https://github.com/silverwind), distributed under BSD licence
