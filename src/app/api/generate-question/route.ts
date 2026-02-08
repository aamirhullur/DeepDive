import { NextResponse } from "next/server";
import { generateObject, LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from "zod";
import { ModelProvider } from "@/config/models";

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

const getModelInstance = (provider: ModelProvider): LanguageModel => {
    switch (provider) {
        case 'openai':
            return openai("gpt-4o"); 
        // case 'openrouter':
        //     return openrouter("google/gemini-2.0-flash-lite-preview-02-05:free"); 
        // case 'deepseek':
        //     return deepseek("Deepseek-V3-0324")
        case 'gemini':
        default:
            return google("gemini-2.0-flash-exp");
    }
}

const clarifyResearchGoals = async(topic: string, provider: ModelProvider) => {
    
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
        
        return object.questions;
        
    }catch(e){
        console.log("Generate Error : ",e)
    }
}


export async function POST(req: Request){

    try{

        const {topic, modelProvider} = await req.json();
        console.log("TOPIC:", topic); 
        console.log("Model Provider: ", modelProvider)
        const questions = await clarifyResearchGoals(topic, modelProvider as ModelProvider);
        console.log("Questions:", questions)

        return NextResponse.json(questions)
    } catch(err){
        console.log("Generate Error : ",err)

        return NextResponse.json({
            success: false,
            error: "Failed",
        },{status: 500})
    }
}