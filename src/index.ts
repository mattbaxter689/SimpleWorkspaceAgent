import { OpenAPIHono } from '@hono/zod-openapi'
import pino from 'pino'
import { structuredLogger, type StructuredLoggerEnv } from '@hono/structured-logger'
import { getHealthRoute, queryRoute } from './routes/query'
import { azureWorkspaceConnection } from './credentials'
import type { AzureMachineLearningServicesManagementClient } from '@azure/arm-machinelearning'

type AppEnv = StructuredLoggerEnv<pino.Logger> & {
    Variables: {
        azureClient: AzureMachineLearningServicesManagementClient
    }
}

const rootLogger = pino()
const app = new OpenAPIHono<AppEnv>()

// before startup of application, ensure azure client creates successfully
let azureClientInstance: AzureMachineLearningServicesManagementClient

try {
    azureClientInstance = await azureWorkspaceConnection(rootLogger)
} catch (error) {
    rootLogger.fatal(
        { err: error instanceof Error ? error.message : error },
        "❌ STARTUP ABORTED: Live network validation to Azure ML failed. Exiting process!"
    )
    process.exit(1)
}

app.use("*", async (c, next) => {
    c.set('azureClient', azureClientInstance)
    await next()
})

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
    return c.json({ answer: `Processed your question: "${question}"` }, 200)
})

app.doc('/doc', { openapi: '3.0.0', info: { title: 'Azure ML Agent API', version: '1.0.0' } })

export default app
