import { createGoogle } from '@ai-sdk/google'
import { generateText } from 'ai'
import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import pino from 'pino'
import { structuredLogger, type StructuredLoggerEnv } from '@hono/structured-logger'
import type { AzureMachineLearningServicesManagementClient } from '@azure/arm-machinelearning'
import { getAzureClient } from './credentials'
import { getHealthRoute, chatRoute } from './routes/openapi_routes'
import { envConfig } from './config/env_config'

type AppEnv = StructuredLoggerEnv<pino.Logger> & {
    Variables: {
        azureClient: AzureMachineLearningServicesManagementClient
    }
}

export const rootLogger = pino()
const app = new OpenAPIHono<AppEnv>()

const google = createGoogle({
    apiKey: envConfig.GEMINI_API_KEY

})

// implement logger for application
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

// create endpoints for application
app.openapi(getHealthRoute, (c) => {
    return c.json({
        status: "OK",
        timestamp: new Date().toISOString()
    }, 200)
})

app.openapi(chatRoute, async (c) => {
    const { question } = c.req.valid('json')

    const client = getAzureClient()

    const { text } = await generateText({
        model: google("gemini-3.5-flash-lite"),
        prompt: question
    })

    return c.json({ answer: `Processed your question: "${text}"` }, 200)
})

app.doc('/doc', { openapi: '3.0.0', info: { title: 'Azure ML Agent API', version: '1.0.0' } })
app.get("/swag", swaggerUI({ url: "/doc" }))

export default app

