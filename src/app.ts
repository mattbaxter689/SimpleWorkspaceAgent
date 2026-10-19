import { createGoogle } from "@ai-sdk/google";
import type { AzureMachineLearningServicesManagementClient } from "@azure/arm-machinelearning";
import { type StructuredLoggerEnv, structuredLogger } from "@hono/structured-logger";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { generateText, stepCountIs } from "ai";
import { bodyLimit } from "hono/body-limit";
import pino from "pino";

import { buildSystemPrompt } from "./agent/system-prompt";
import { envConfig } from "./config/env_config";
import { getAzureClient } from "./credentials";
import { chatRoute, getHealthRoute } from "./routes/openapi_routes";
import { createAllTools } from "./tools/toolFactory";
import { describeUploads, readUploads } from "./uploads/uploads";
import { MAX_BODY_BYTES } from "./uploads/uploads";

type AppEnv = StructuredLoggerEnv<pino.Logger> & {
    Variables: {
        azureClient: AzureMachineLearningServicesManagementClient;
    };
};

export const rootLogger = pino();
const app = new OpenAPIHono<AppEnv>();

const google = createGoogle({
    apiKey: envConfig.GEMINI_API_KEY,
});

// implement logger for application
app.use(
    structuredLogger({
        createLogger: () => rootLogger,
        onResponse: (logger, c, elapsedMs) => {
            logger.info(
                {
                    method: c.req.method,
                    path: c.req.path,
                    status: c.res.status,
                    elapsedMs,
                },
                "request completed",
            );
        },
    }),
);

app.use("/api/*", bodyLimit({ maxSize: MAX_BODY_BYTES }));

// create endpoints for application
app.openapi(getHealthRoute, (c) => {
    return c.json(
        {
            status: "OK",
            timestamp: new Date().toISOString(),
        },
        200,
    );
});

app.openapi(chatRoute, async (c) => {
    const { question, spec, data } = c.req.valid("form");
    const uploads = await readUploads({ spec, data });
    rootLogger.info("Makes it to here")

    // create the context for tools
    const azureCtx = {
        client: getAzureClient(),
        resourceGroup: envConfig.AZURE_RESOURCE_GROUP,
        workspaceName: envConfig.AZURE_WORKSPACE_NAME,
    };

    // instantiate the tools here
    const tools = createAllTools({ azureCtx, uploads });

    const result = await generateText({
        model: google("gemini-3.5-flash-lite"),
        instructions: buildSystemPrompt("oneShot"),
        prompt: question + describeUploads(uploads),
        tools: tools,
        maxRetries: 3,
        stopWhen: stepCountIs(15),
    });

    return c.json(
        {
            answer: result.text,
            toolsCalled: result.steps.flatMap((s) => s.toolCalls.map((t) => t.toolName)),
        },
        200,
    );
});

app.doc("/doc", { openapi: "3.0.0", info: { title: "Azure ML Agent API", version: "1.0.0" } });
app.get("/swag", swaggerUI({ url: "/doc" }));

export default app;
