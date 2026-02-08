import { createDataStreamResponse } from "ai";
import { ResearchState } from "./types";
import { deepResearch } from "./main";
import { ModelProvider } from "@/config/models";

export async function POST(req: Request) {
	try {
		const {messages} = await req.json(); 
        const lastMessageContent = messages[messages.length -1].content;

        
        const parsed = JSON.parse(lastMessageContent);
        const topic = parsed.topic;
        const clarifications = parsed.clarifications;
		const modelProvider = (parsed.modelProvider || "gemini") as ModelProvider;
		const modelId = parsed.modelId || ""; // Extract modelId from the request


		return createDataStreamResponse({
			execute: async (dataStream) => {
			  // Write data
			//   dataStream.writeData({ value: 'Hello' });

			const researchState: ResearchState = {
				topic: topic,
				completedSteps: 0,
				tokenUsed: 0,
				findings: [],
				processedUrl: new Set(),
				clarificationsText: JSON.stringify(clarifications),
				modelProvider: modelProvider,
				modelId: modelId, // Add modelId to research state
			}

			await deepResearch(researchState, dataStream)

			},
			// onError: error => `Custom error: ${error.message}`,
		  });
	} catch (err) {

        return new Response(
			JSON.stringify({
				success: false,
                err: err instanceof Error ? err.message: "Invalid message format!"
			}),
			{ status: 500 }
		);
    }
}
