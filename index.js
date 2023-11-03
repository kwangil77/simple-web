require('@grpc/grpc-js')

const express = require('express')
const promBundle = require('express-prom-bundle')
const expressWinston = require('express-winston')
const next = require('next')
const winston = require('winston')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(expressWinston.logger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console()
    ]
  }))
  server.use(promBundle({
    includeMethod: true,
    includePath: true,
    promClient: {
      collectDefaultMetrics: {}
    }
  }))
  server.get('/health', (req, res) => {
    res.end('ok')
  })
  server.get('*', (req, res) => {
    return handle(req, res)
  })
  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})