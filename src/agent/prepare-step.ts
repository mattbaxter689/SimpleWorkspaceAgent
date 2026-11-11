import type { ModelMessage } from "ai";

const CREATE_TOOLS = ["createComputeFromSpec", "createDataAssetFromSpec"];

export const gateCreateTools =
    (allToolNames: string[]) =>
    ({ messages }: { messages: ModelMessage[] }) => {
        const lastUser = messages.map((m) => m.role).lastIndexOf("user");
        let validated = false;

        for (const m of messages.slice(lastUser + 1)) {
            if (typeof m.content === "string") continue;
            for (const part of m.content as any[]) {
                if (part.type === "tool-result" && part.toolName === "validateSpec") {
                    const out = part.output?.value ?? part.output;
                    if (out?.valid === true) validated = true;
                }
            }
        }
        return validated
            ? {}
            : { activeTools: allToolNames.filter((n) => !CREATE_TOOLS.includes(n)) as any };
    };
