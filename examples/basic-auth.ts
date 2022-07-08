import { pipe } from "@effect-ts/core"
import * as T from "@effect-ts/core/Effect"
import * as N from "@effect-ts/node/Runtime"

import FastifyBasicAuth from "@fastify/basic-auth"

import { FastifyLive, listen, get, server, after } from "../packages/fastify/src"

import { FastifyReply, FastifyRequest } from "fastify"

const handler = (_request: FastifyRequest, reply: FastifyReply) =>
  T.gen(function* (_) {
    yield* _(
      T.succeedWith(() => {
        reply.send("OK")
      })
    )
  })

async function validate(username: string, password: string) {
  if (username !== "admin" || password !== "admin") {
    return new Error("Not an admin!")
  }
}

const publicHandler = (_req: FastifyRequest, _reply: FastifyReply) => T.succeed("OK")

pipe(
  T.gen(function* (_) {
    const fastify = yield* _(server)

    fastify.register(FastifyBasicAuth, { validate, authenticate: true })

    const opts = T.gen(function* (_) {
      const { basicAuth } = yield* _(server)
      return {
        onRequest: basicAuth
      }
    })

    yield* _(after())
    yield* _(get("/admin", opts, handler))
    yield* _(get("/", publicHandler))

    yield* _(listen(3000, "localhost"))
    console.log("listening to localhost:3000!")

    yield* _(T.never)
  }),
  T.provideSomeLayer(FastifyLive),
  N.runMain
)
