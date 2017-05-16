# toa-cors

CORS middleware for Toa.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

## Demo

```js
const Toa = require('toa')
const toaCORS = require('toa-cors')

const app = new Toa()
app.use(toaCORS({
  credentials: true,
  allowOrigins: ['*']
}))
app.use(function () {
  this.body = 'hello'
})
app.listen(3000)
```

## Installation

```bash
npm install toa-cors
```

## API

```js
app.use(toaCORS(options))
```

default `options`:

```js
const defaultOptions = {
  // allowOrigins defines the origins which will be allowed to access
  // the resource. Default value is:
  allowOrigins: ['*'],
  // allowMethods defines the methods which will be allowed to access
  // the resource. It is used in handling the preflighted requests.
  // Default value is:
  allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
  // allowHeaders defines the headers which will be allowed in the actual
  // request. It is used in handling the preflighted requests.
  allowHeaders: [],
  // exposeHeaders defines the allowed headers that client could send when
  // accessing the resource.
  exposeHeaders: [],
  // maxAge defines the max age that the preflighted requests can be cached, seconds.
  maxAge: 0,
  // credentials defines whether or not the response to the request can be exposed.
  credentials: false,
  // allowOriginsValidator validates the request Origin by validator
  // function. The validator function accpects the origin and should returns the
  // Access-Control-Allow-Origin value. If the validator is set, then
  // allowMethods will be ignored.
  allowOriginsValidator: null
}
```

default `options.allowOriginsValidator`:

```js
if (opts.allowOriginsValidator == null) {
  opts.allowOriginsValidator = (origin) => {
    for (let key of Object.keys(opts.allowOrigins)) {
      if (opts.allowOrigins[key] === origin || opts.allowOrigins[key] === '*') {
        return origin
      }
    }
    return ''
  }
}
```

## License

The MIT License (MIT)

[npm-url]: https://npmjs.org/package/toa-cors
[npm-image]: http://img.shields.io/npm/v/toa-cors.svg

[travis-url]: https://travis-ci.org/toajs/toa-cors
[travis-image]: http://img.shields.io/travis/toajs/toa-cors.svg

[coveralls-url]: https://coveralls.io/r/toajs/toa-cors
[coveralls-image]: https://coveralls.io/repos/toajs/toa-cors/badge.svg

[downloads-url]: https://npmjs.org/package/toa-cors
[downloads-image]: http://img.shields.io/npm/dm/toa-cors.svg?style=flat-square