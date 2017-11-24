'use strict'

const assert = require('assert')
const request = require('supertest')
const Toa = require('toa')
const tman = require('tman')
const toaCORS = require('..')

tman.suite('toa-cors', function () {
  tman.suite('with default options', function () {
    const app = new Toa()
    app.use(toaCORS({
      credentials: true
    }))

    app.use(function () {
      this.body = 'ok'
    })
    const srv = app.listen()

    tman.it('Should set default allowed methods and headers', function * () {
      yield request(srv)
        .options('/')
        .set('Origin', 'test.org')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers')
        .expect('Content-Length', '0')
        .expect('Access-Control-Allow-Origin', 'test.org')
        .expect('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE, PATCH')
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect(200)
    })
  })

  tman.suite('with some options', function () {
    const app = new Toa()
    app.use(toaCORS({
      allowOrigins: ['test.org'],
      allowMethods: ['GET', 'PUT'],
      allowHeaders: ['CORS-Test-Allow-Header'],
      exposeHeaders: ['CORS-Test-Expose-Header'],
      maxAge: 10,
      credentials: true
    }))

    app.use(function () {
      this.body = 'ok'
    })
    const srv = app.listen()

    tman.it('Should not set Access-Control-Allow-Origin when request Origin header missing', function * () {
      yield request(srv)
        .get('/')
        .expect('Vary', 'Origin')
        .expect((res) => {
          assert.strictEqual(res.headers['access-control-allow-origin'], undefined)
        })
        .expect(200)
    })

    tman.it('Should success when request Origin header is invalid', function * () {
      yield request(srv)
        .get('/')
        .set('Origin', 'not-allowed.org')
        .expect('Vary', 'Origin')
        .expect((res) => {
          assert.strictEqual(res.headers['access-control-allow-origin'], undefined)
        })
        .expect(200)
    })

    tman.it('Should set Access-Control-Allow-Origin when request Origin header is qualified', function * () {
      yield request(srv)
        .get('/')
        .set('Origin', 'test.org')
        .expect('Vary', 'Origin')
        .expect('Access-Control-Allow-Origin', 'test.org')
        .expect(200)
    })

    tman.it('Should not set Access-Control-Allow-Origin when is invalid prefilghted request', function * () {
      yield request(srv)
        .options('/')
        .set('Origin', 'test.org')
        .expect('Content-Length', '0')
        .expect('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers')
        .expect((res) => {
          assert.strictEqual(res.headers['access-control-allow-origin'], undefined)
        })
        .expect(200)
    })

    tman.it('Should set headers as specfied in options when prefilghted request is valid', function * () {
      yield request(srv)
        .options('/')
        .set('Origin', 'test.org')
        .set('Access-Control-Request-Method', 'PUT')
        .expect('Content-Length', '0')
        .expect('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers')
        .expect('Access-Control-Allow-Origin', 'test.org')
        .expect('Access-Control-Max-Age', '10')
        .expect('Access-Control-Allow-Methods', 'GET, PUT')
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect('Access-Control-Allow-Headers', 'CORS-Test-Allow-Header')
        .expect((res) => {
          assert.strictEqual(res.headers['access-control-expose-origin'], undefined)
        })
        .expect(200)
    })

    tman.it('Should set headers as specfied in options when is simple request', function * () {
      yield request(srv)
        .get('/')
        .set('Origin', 'test.org')
        .expect('Vary', 'Origin')
        .expect('Access-Control-Allow-Origin', 'test.org')
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect('Access-Control-Expose-Headers', 'CORS-Test-Expose-Header')
        .expect((res) => {
          assert.strictEqual(res.headers['access-control-max-age'], undefined)
          assert.strictEqual(res.headers['access-control-allow-methods'], undefined)
          assert.strictEqual(res.headers['access-control-allow-headers'], undefined)
        })
        .expect(200)
    })
  })

  tman.suite('with custom allowOriginsValidator', function () {
    const app = new Toa()
    app.use(toaCORS({
      allowOriginsValidator: (origin) => { return origin === 'not-allow-origin.com' ? '' : 'test-origin.com' }
    }))

    app.use(function () {
      this.body = 'ok'
    })
    const srv = app.listen()

    tman.it('Should returns the custom allowed origin returned by validator', function * () {
      yield request(srv)
        .get('/')
        .set('Origin', 'test.com')
        .expect('Vary', 'Origin')
        .expect('Access-Control-Allow-Origin', 'test-origin.com')
        .expect(200)
    })

    tman.it('Should returns 200 when not pass the validator', function * () {
      yield request(srv)
        .get('/')
        .set('Origin', 'not-allow-origin.com')
        .expect('Vary', 'Origin')
        .expect((res) => {
          assert.strictEqual(res.headers['access-control-allow-origin'], undefined)
        })
        .expect(200)
    })
  })
})
