import { createRoute, z } from "@hono/zod-openapi";

export const getHealthRoute = createRoute({
    method: "get",
    path: "/health",
    responses: {
        200: {
            content: {
                "application/json": { schema: z.object({ status: z.string(), timestamp: z.string() }) },
            },
            description: "Health check response",
        },
    },
});

const FileField = z.instanceof(File);

const OptionalFile = (description: string) =>
    z
        .preprocess(
            (v) => (v === "" || v === null ? undefined : v),
            FileField.optional(),
        )
        .openapi({ type: "string", format: "binary", description });

export const chatRoute = createRoute({
    method: "post",
    path: "/api/chat",
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        question: z
                            .string()
                            .min(5)
                            .openapi({ example: "Create the compute cluster from my spec" }),
                        spec: OptionalFile("YAML spec (compute cluster or data asset)"),
                        data: OptionalFile("Parquet file, when creating a data asset"),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        answer: z.string(),
                        toolsCalled: z
                            .array(z.string())
                            .openapi({ description: "Tools the agent called, in order" }),
                    }),
                },
            },
            description: "Answer to the users question with the agent response",
        },
    },
});
