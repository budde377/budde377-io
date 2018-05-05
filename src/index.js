// @flow

import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'
import config from 'config'
import uuidV4 from 'uuid/v4'
import fetch from 'node-fetch'
import session from 'koa-session'
import { RedisStore } from './util/store'
import qs from 'querystring'

const app = new Koa()

app.keys = config.get('server.keys')

app.use(session({...config.session, store: new RedisStore()}, app))

async function fetchIdToken (code: string): Promise<string> {
  try {
    const res = await fetch(
      `https://${config.auth.domain}/oauth/token`,
      {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: config.auth.clientId,
          client_secret: config.auth.clientSecret,
          code,
          redirect_uri: config.auth.redirectUri
        })
      })
    const {id_token: idToken} = await res.json()
    return idToken
  } catch (err) {
    throw new Error(err.message)
  }
}

app.use(async (ctx: *, next: *) => {
  switch (ctx.path) {
    case '/auth/login':
      const {domain, audience, scope, clientId, redirectUri} = config.get('auth')
      const state = uuidV4()
      const responseType = 'code'
      const q = {
        audience,
        scope,
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        response_type: responseType
      }
      ctx.session.authState = state
      ctx.redirect(`https://${domain}/authorize?${qs.stringify(q)}`)
      break
    case '/auth/callback':
      const {code, state: newState} = ctx.request.query
      const oldState = await ctx.session.authState
      if (oldState === newState) {
        ctx.session.idToken = await fetchIdToken(code)
        ctx.session.authState = null
      } else {
        ctx.session.authState = null
      }
      ctx.redirect('/token')
      break
    case '/auth/logout':
      ctx.session.idToken = null
      ctx.redirect('/')
      break
    default:
      await next()
  }
})

app.use((ctx: *, next: *) => {
  switch (ctx.path) {
    case '/token':
      ctx.response.type = 'application/json'
      ctx.response.body = JSON.stringify({token: ctx.session.idToken}, null, 2)
      return
    default:
      return next()
  }
})

app.use(serve(path.join(__dirname, '..', 'static')))

app.listen(config.get('port'))
console.log(`Listening on port ${config.get('port')}`)
