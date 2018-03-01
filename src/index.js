// @flow

import Koa from 'koa'

const app = new Koa()

app.use((ctx: *) => {
  ctx.body = 'Hello world :)'
})

export default app
