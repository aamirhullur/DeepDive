import { z } from "zod"
import { ModelProvider } from "@/config/models";

export interface ResearchFindings {
    summary: string,
    source: string,
}

export interface ResearchState {
    topic: string,
    completedSteps: number,
    tokenUsed: number,
    findings: ResearchFindings[],
    processedUrl: Set<string>,
    clarificationsText: string,
    modelProvider: ModelProvider,
    modelId: string;
}

export interface ModelCallOptions<T>{
    model?: string,
    provider: ModelProvider,
    modelId: string,
    prompt: string,
    system: string,
    schema?: z.ZodType<T>;
    activityType?: Activity["type"];
}

export interface SearchResult{
    title: string,
    url: string,
    content: string
}

export interface Activity {
    type: 'search' |'extract' |'analyze' | 'generate' | 'planning' ;
    status: 'pending' |'complete' |'warning' | 'error' ;
    message: string,
    timestamp?: number;
}

export interface ActivityTracker {
    add: (type: Activity['type'], status: Activity['status'] ,message:Activity['message']) => void;
}


export interface Sources{
    url: string,
    title: string,
}