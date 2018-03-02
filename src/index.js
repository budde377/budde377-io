// @flow

import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'

const app = new Koa()

app.use(serve(path.join(__dirname, '..', 'static')))

export default app
