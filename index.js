const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')

const httpServer = http.createServer((req, res) => {
  unifiedServer(req,res)
})

// Start the HTTP server
httpServer.listen(config.httpPort, '0.0.0.0', () => {
  console.log(`The HTTP server's listening on ${config.httpPort}`);
})

// const httpsServerOptions = {
//   'key': fs.readFileSync('./https/key.pem'),
//   'cert': fs.readFileSync('./https/cert.pem')
// }

// console.log(httpsServerOptions.key);


// const httpsServer = https.createServer(httpsServerOptions, (req,res) => {
//   unifiedServer(req,res)
// })

// // Start the HTTPS server
// httpsServer.listen(config.httpsPort, () => {
//   console.log(`The HTTPS server's listening on ${config.httpsPort}`);
// })

const unifiedServer = (request, response) => {
    
  // Get and parse url
  const parsedUrl = url.parse(request.url, true)

  // Get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g,'')

  // Get the query string as an object
  const queryStringObject = parsedUrl.query

  // Get the method
  const method = request.method.toLowerCase()

  // Get the headers as an object
  const headers = request.headers

  // Get the payload, if any
  // the payload (body) comes in as a stream, not a whole thing
  var decoder = new StringDecoder('utf-8')
  var buffer = ''
  request.on('data', data => {
    console.log('\na chunk: ' + decoder.write(data));
    buffer += decoder.write(data)
  }).on('end', () => {
    buffer += decoder.end()
    // Choose the handler this request should go to.

    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? handlers[trimmedPath] : handlers.notFound

    try {
      buffer = JSON.parse(buffer)
    } catch (e) {
      console.info('Couldn\'t parse body of a request.')
      buffer = {}
    }

    const data = {
      'trimmedPath' : trimmedPath,
      'method' : method,
      'query' : queryStringObject,
      'body' : buffer,
      'headers' : headers,
    }      

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200

      payload = typeof(payload) === 'object' ? payload : {}

      const payloadString = JSON.stringify(payload)

      response.setHeader('Content-Type', 'application/json')
      response.writeHead(statusCode)
      response.end(payloadString)
      
      console.log('Returning this response: ', statusCode, payloadString);
      
    })

  }).on('error', err => {
    console.error(err.stack)
  })

  // Log the request info
  console.log(`${method}: Request on path: ${trimmedPath}
  query: ${JSON.stringify(queryStringObject, null, 2)}
  headers: ${JSON.stringify(headers, null, 2)}`);
  
}


// Define handlers
var handlers = {}

handlers.ping = (data, callback) => {
  callback(200)
}

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404)
}

// Define a request router
var router = {
  'ping': handlers.ping
}

