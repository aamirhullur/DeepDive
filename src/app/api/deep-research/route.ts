import { createDataStreamResponse } from "ai";
import { ResearchState } from "./types";
import { deepResearch } from "./main";
import { ModelProvider } from "@/config/models";
import { RateLimiter } from "@/lib/rateLimiter";

const rateLimiter = new RateLimiter();

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const lastMessageContent = messages[messages.length - 1].content;

        const parsed = JSON.parse(lastMessageContent);
        const topic = parsed.topic;
        const clarifications = parsed.clarifications;
        const modelProvider = (parsed.modelProvider || "gemini") as ModelProvider;
        const modelId = parsed.modelId || "";
        const visitorId = parsed.visitorId;

        // Check if visitorId exists
        if (!visitorId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "No visitor ID provided"
                }),
                { status: 400 }
            );
        }

        return createDataStreamResponse({
            execute: async (dataStream) => {
                const researchState: ResearchState = {
                    topic: topic,
                    completedSteps: 0,
                    tokenUsed: 0,
                    findings: [],
                    processedUrl: new Set(),
                    clarificationsText: JSON.stringify(clarifications),
                    modelProvider: modelProvider,
                    modelId: modelId,
                };

                await deepResearch(researchState, dataStream);
            }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({
                success: false,
                error: err instanceof Error ? err.message : "Invalid message format!"
            }),
            { status: 500 }
        );
    }
}
