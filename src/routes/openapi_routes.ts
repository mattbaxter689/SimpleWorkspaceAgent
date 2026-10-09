import { createRoute, z } from "@hono/zod-openapi"

export const getHealthRoute = createRoute({
    method: "get",
    path: "/health",
    responses: {
        200: {
            content: { 'application/json': { schema: z.object({ status: z.string(), timestamp: z.string() }) } },
            description: 'Health check response',
        }
    }
})

export const chatRoute = createRoute({
    method: "post",
    path: "/api/chat",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        question: z.string().min(5).openapi({ example: 'What is Hono?' }),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({ answer: z.string() }),
                },
            },
            description: "Answer to the users question with the agent response"
        },
    },
})
