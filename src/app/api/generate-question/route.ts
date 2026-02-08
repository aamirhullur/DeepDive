import { NextResponse } from "next/server";
import { generateObject, generateText, LanguageModel, Output } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from "zod";
import { ModelProvider } from "@/config/models";
import { RateLimiter } from "@/lib/rateLimiter";
// import { deepseek } from "@ai-sdk/deepseek";

// const openrouter = createOpenRouter({
//     apiKey: process.env.OPENROUTER_API_KEY || "",
//   });

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

const openai = createOpenAI({
    baseURL: process.env.AZURE_OPENAI_ENDPOINT || "",
    apiKey: process.env.GITHUB_API_KEY || "",
    compatibility: 'compatible'
});

// const deepseek = createOpenAI({
//     baseURL: process.env.AZURE_OPENAI_ENDPOINT || "",
//     apiKey: process.env.GITHUB_API_KEY || "",
//     compatibility: 'compatible'
// });

const grok = createOpenAI({
    baseURL: process.env.AZURE_OPENAI_ENDPOINT || "",
    apiKey: process.env.GITHUB_API_KEY || "",
    compatibility: 'compatible'
})

const rateLimiter = new RateLimiter();


const getModelInstance = (provider: ModelProvider): LanguageModel => {
    switch (provider) {
        case 'openai':
            return openai("gpt-4o"); 
        // case 'openrouter':
        //     return openrouter("google/gemini-2.0-flash-lite-preview-02-05:free"); 
        // case 'deepseek':
        //     return deepseek("Deepseek-V3-0324")
        // case 'grok':
            // return grok("grok-3");
        case 'gemini':
        default:
            // return google("gemini-2.0-flash");
            return grok("grok-3");
    }
}

async function clarifyResearchGoals(topic: string, provider: ModelProvider) {
    // const prompt = `
    // Given the research topic <topic>${topic}</topic>, generate 2-4 clarifying questions to help narrow down the research scope. Focus on identifying: 
    // - Specific aspects of interes
    // - Reqiored depth/complexity level
    // `
    const prompt = `
    You are an expert research assistant tasked with helping narrow down a research topic.

    RESEARCH TOPIC: "${topic}"

    Generate 2-4 thoughtful clarifying questions that will help define the scope and direction of this research. 
    
    Focus your questions on:
    - Specific aspects or subtopics that need exploration
    - Desired depth and complexity level
    - Potential angles or perspectives to consider
    - Time period or geographical constraints (if relevant)
    - Intended audience or purpose for this research
    
    Your questions should be clear, specific, and designed to elicit information that meaningfully narrows the research focus.
    Format your response as structured data containing only the questions array.
    `

        try{
            const modelInstance = getModelInstance(provider)
    
            // const {text:rawOutput} = await generateText({
            //     model: modelInstance,
            //     prompt,
            // })
            // console.log("Raw Output: ", rawOutput)
            // const { object } = await generateObject({
            //     model: openai("gpt-4.1-mini"),
            //     prompt: 'Extract the questions array from this text: \n' + rawOutput,
            //     schema: z.object({
            //         questions: z.array(z.string())
            //     }),
            //     // mode:"json"
            //   }); 
    
            const { object } = await generateObject({
                model: modelInstance,
                prompt,
                schema: z.object({
                    questions: z.array(z.string())
                }),
                // mode:"json"
              }); 
    
            // const object = await generateText({
            //     model: modelInstance,
            //     prompt,
            //     experimental_output: Output.object({
            //         schema: z.object({questions: z.array(z.string())})
            //     }),
            // })
            console.log(object)
            return object.questions;
            
        }catch(e){
            console.log("Generate Error : ",e)
        }
}


// async function clarifyResearchGoals(topic: string, modelProvider: ModelProvider, modelId: string) {
//     try {
//         const researchState: ResearchState = {
//             topic,
//             completedSteps: 0,
//             tokenUsed: 0,
//             findings: [],
//             processedUrl: new Set(),
//             clarificationsText: "",
//             modelProvider,
//             modelId,
//         };

//         const result = await callModel(
//             {
//                 provider: modelProvider,
//                 modelId,
//                 prompt: `Generate 3-5 clarifying questions to better understand the research needs for the topic: "${topic}". The questions should help understand the user's specific interests and requirements.`,
//                 system: "You are a research assistant helping to clarify research goals. Generate focused, relevant questions that will help understand the user's specific needs.",
//                 schema: z.array(z.string()).describe("List of clarifying questions"),
//                 activityType: "planning"
//             },
//             researchState,
//             {
//                 add: (type, status, message) => {
//                     console.log(`${type}: ${status} - ${message}`);
//                 }
//             }
//         );

//         return Array.isArray(result) ? result : [];
//     } catch (err) {
//         console.error("Error in clarifyResearchGoals:", err);
//         return [
//             "What specific aspects of this topic interest you the most?",
//             "What is your current level of knowledge about this topic?",
//             "What are you hoping to learn from this research?"
//         ];
//     }
// }


export async function POST(req: Request){

    try{
        const {topic, modelProvider,visitorId} = await req.json();

        if (!visitorId) {
            return NextResponse.json({
                success: false,
                error: "No fingerprint provided",
            }, { status: 400 });
        }

        const { allowed, remaining, timeUntilReset } = await rateLimiter.checkAndIncrementUsage(visitorId);
        
        if (!allowed) {
            return NextResponse.json({
                success: false,
                error: "Rate limit exceeded",
                timeUntilReset,
            }, { status: 429 });
        }

        console.log("TOPIC:", topic); 
        console.log("Model Provider: ", modelProvider)
        const questions = await clarifyResearchGoals(topic, modelProvider as ModelProvider);
        console.log("Questions:", questions)

        const response = NextResponse.json(questions);
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        return response;

        // return NextResponse.json(questions)
    } catch(err){
        console.log("Generate Error : ",err)

        return NextResponse.json({
            success: false,
            error: "Failed to generate questions",
        },{status: 500})
    }
}

// export async function POST(req: Request) {
//     try {
//         const { topic, modelProvider, modelId, visitorId } = await req.json();
        
//         // Validate visitorId
//         if (!visitorId) {
//             return NextResponse.json({
//                 success: false,
//                 error: "No fingerprint provided",
//             }, { status: 400 });
//         }

//         // Check rate limit
//         const isAllowed = await rateLimiter.isAllowed(visitorId);
//         if (!isAllowed) {
//             const timeUntilReset = await rateLimiter.getTimeUntilReset(visitorId);
//             return NextResponse.json({
//                 success: false,
//                 error: "Rate limit exceeded",
//                 timeUntilReset,
//             }, { status: 429 });
//         }

//         console.log("TOPIC:", topic);
//         console.log("Model Provider:", modelProvider);
//         const questions = await clarifyResearchGoals(topic, modelProvider as ModelProvider, modelId);
//         console.log("Questions:", questions);

//         // Get remaining attempts for response header
//         const remainingAttempts = await rateLimiter.getRemainingAttempts(visitorId);
        
//         // Create response with rate limit headers
//         const response = NextResponse.json(questions);
//         response.headers.set('X-RateLimit-Remaining', remainingAttempts.toString());
//         return response;

//     } catch (err) {
//         console.log("Generate Error:", err);
//         return NextResponse.json({
//             success: false,
//             error: "Failed to generate questions",
//         }, { status: 500 });
//     }
// }