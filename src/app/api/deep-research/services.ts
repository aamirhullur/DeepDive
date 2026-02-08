import Exa from "exa-js"
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

export const exa = new Exa(process.env.EXA_SEARCH_API_KEY || "");

// export const openrouter = createOpenRouter({
//     apiKey: process.env.OPENROUTER_API_KEY || "",
//   });

export const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

export const openai = createOpenAI({
    baseURL: process.env.AZURE_OPENAI_ENDPOINT || "",
    apiKey: process.env.GITHUB_API_KEY || "",
    compatibility: 'compatible'
});
    
// export const deepseek = createDeepSeek({
//     baseURL: process.env.AZURE_OPENAI_ENDPOINT || "",
//     apiKey: process.env.GITHUB_API_KEY || "",
//     // compatibility: 'compatible'
// });

