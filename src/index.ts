import app, { rootLogger } from './app'
import { initAzureWorkspaceConnection } from './credentials'

async function bootstrap() {
    try {
        await initAzureWorkspaceConnection(rootLogger)
        rootLogger.info("Azure ML Client initialized and workspace verified")
    } catch (error) {
        rootLogger.fatal(
            { err: error instanceof Error ? error.message : error },
            "STARTUP ABORTED: Live network validation to Azure ML failed. Exiting process!"
        )
        process.exit(1)
    }

    const port = 3000
    rootLogger.info(`Bun server running on port ${port}`)

    Bun.serve({
        fetch: app.fetch,
        port
    })
}

bootstrap()
