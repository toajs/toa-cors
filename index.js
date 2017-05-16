'use strict'
// **Github:** https://github.com/toajs/toa-cors
//
// **License:** MIT

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

module.exports = function toaCORS (opts) {
  if (!opts) opts = {}
  for (let key of Object.keys(defaultOptions)) {
    if (opts[key] == null) opts[key] = defaultOptions[key]
  }
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

  return function cors () {
    // Always set Vary, see https://github.com/rs/cors/issues/10
    this.vary('Origin')

    let origin = this.get('origin')
    // not a CORS request.
    if (origin === '') return

    let allowOrigin = opts.allowOriginsValidator.call(this, origin)
    // If the request Origin header is not allowed. Just terminate the following steps.
    if (allowOrigin === '') {
      this.throw(403, `Origin "${origin}" is not allowed`)
    }
    if (opts.credentials) {
      // when responding to a credentialed request, server must specify a
      // domain, and cannot use wild carding.
      // See *important note* in https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Requests_with_credentials .
      this.set('Access-Control-Allow-Credentials', 'true')
    }
    this.set('Access-Control-Allow-Origin', allowOrigin)

    // Handle preflighted requests (https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Preflighted_requests) .
    if (this.method === 'OPTIONS') {
      this.vary('Access-Control-Request-Method')
      this.vary('Access-Control-Request-Headers')

      let requestMethod = this.get('Access-Control-Request-Method')
      // If there is no "Access-Control-Request-Method" request header. We just
      // treat this request as an invalid preflighted request, so terminate the
      // following steps.
      if (requestMethod === '') {
        this.remove('Access-Control-Allow-Origin')
        this.remove('Access-Control-Allow-Credentials')
        this.throw(403, 'invalid preflighted request, missing Access-Control-Request-Method header')
      }

      if (opts.allowMethods.length > 0) {
        this.set('Access-Control-Allow-Methods', opts.allowMethods.join(', '))
      }

      let allowHeaders = ''
      if (opts.allowHeaders.length > 0) {
        allowHeaders = opts.allowHeaders.join(', ')
      } else {
        allowHeaders = this.get('Access-Control-Request-Headers')
      }
      if (allowHeaders !== '') {
        this.set('Access-Control-Allow-Headers', allowHeaders)
      }

      if (opts.maxAge > 0) {
        this.set('Access-Control-Max-Age', String(opts.maxAge))
      }
      this.status = 204
      return this.end()
    }

    if (opts.exposeHeaders.length > 0) {
      this.set('Access-Control-Expose-Headers', opts.exposeHeaders.join(', '))
    }
  }
}
