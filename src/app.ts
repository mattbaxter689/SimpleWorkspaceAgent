import { OpenAPIHono } from '@hono/zod-openapi'
import pino from 'pino'
import { structuredLogger, type StructuredLoggerEnv } from '@hono/structured-logger'
import { getHealthRoute, queryRoute } from './routes/query'
import type { AzureMachineLearningServicesManagementClient } from '@azure/arm-machinelearning'
import { getAzureClient } from './credentials'

type AppEnv = StructuredLoggerEnv<pino.Logger> & {
    Variables: {
        azureClient: AzureMachineLearningServicesManagementClient
    }
}

export const rootLogger = pino()
const app = new OpenAPIHono<AppEnv>()

app.use(
    structuredLogger({
        createLogger: () => rootLogger,
        onResponse: (logger, c, elapsedMs) => {
            logger.info({
                method: c.req.method,
                path: c.req.path,
                status: c.res.status,
                elapsedMs
            }, 'request completed')
        }
    })
)

app.openapi(getHealthRoute, (c) => {
    return c.json({
        status: "OK",
        timestamp: new Date().toISOString()
    }, 200)
})

app.openapi(queryRoute, (c) => {
    const { question } = c.req.valid('json')

    const client = getAzureClient()

    return c.json({ answer: `Processed your question: "${question}"` }, 200)
})

app.doc('/doc', { openapi: '3.0.0', info: { title: 'Azure ML Agent API', version: '1.0.0' } })

export default app

