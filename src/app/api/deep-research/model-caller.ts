import { ActivityTracker, ModelCallOptions } from "./types";
import { ResearchState } from "./types";
import { google, openai } from "./services";
import { generateObject, generateText, LanguageModel } from "ai";
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from "./constants";
import { delay } from "./utils";
import { 
  ModelProvider, 
  TaskType,
  taskModelMap,
  getModelById,
} from "@/config/models";

const getModelInstance = (provider: ModelProvider, modelId: string, taskType: string): LanguageModel => {
	const taskTypeMapping: Record<string, TaskType> = {
			planning: "PLANNING",
			extract: "EXTRACT",
			analyze: "ANALYZE",
			report: "REPORT",
			generate: "REPORT", 
	};
 
	const mappedTaskType = taskTypeMapping[taskType.toLowerCase()] as TaskType;
	if (!mappedTaskType) {
			throw new Error(`Invalid task type: ${taskType}`);
	}

	let actualModelName: string;
	
	// Only use user-selected model for REPORT/generate phase
	// For PLANNING, EXTRACT, ANALYZE, always use the default models
	if ((mappedTaskType === "REPORT") && modelId) {
			const model = getModelById(provider, modelId);
			if (model) {
				actualModelName = model.apiIdentifier;
				console.log(`Using user-selected model for REPORT: ${modelId} -> ${actualModelName}`);
			} else {
				// Fallback to default model for this provider and task type
				actualModelName = taskModelMap[mappedTaskType]?.[provider] || "";
				console.log(`Model not found, using default model for ${provider}/${mappedTaskType}: ${actualModelName}`);
			}
	} else {
			// Use default models for this provider and task type
			actualModelName = taskModelMap[mappedTaskType]?.[provider] || "";
			console.log(`Using default model for ${provider}/${mappedTaskType}: ${actualModelName}`);
	}

	if (!actualModelName) {
			throw new Error(`Model not found for provider: ${provider}, model ID: ${modelId}, taskType: ${mappedTaskType}`);
	}

	console.log(`Selecting model for Provider: ${provider}, Task: ${mappedTaskType}, Final Model: ${actualModelName}`);
	
	switch (provider) {
		case "openai":
			return openai(actualModelName);
		case "openrouter":
			// Commented code preserved as requested
			// return openrouter(actualModelName);
			throw new Error("OpenRouter provider is not currently enabled");
		case "deepseek":
			// Commented code preserved as requested
			// return deepseek(actualModelName);
			throw new Error("Deepseek provider is not currently enabled");
		case "gemini":
		default:
			return google(actualModelName);
	}
};

export async function callModel<T>(
	{ provider, modelId, prompt, system, schema, activityType = "generate" }: ModelCallOptions<T>,
	researchState: ResearchState,
	activityTracker: ActivityTracker
): Promise<T | string> {

	let attempts = 0;
	let lastError : Error | null = null;
	console.log("Activity Type: ", activityType);
	const taskType = (activityType.toUpperCase() as TaskType);
	console.log(`Task Type: ${taskType}, Provider: ${provider}`);
	const modelInstance = getModelInstance(provider, modelId, taskType);

	while (attempts < MAX_RETRY_ATTEMPTS) {
		try {
			if (schema) {
				console.log("Using Model Instance: ", modelInstance);
				const { object, usage } = await generateObject({
					// Commented code preserved as requested
					// model: openrouter(model),
					// model: model === "gpt-4o" ? openai(model) : google(model),
					model: modelInstance,
					prompt,
					system,
					schema: schema,
				});
		
				researchState.tokenUsed += usage.totalTokens;
				researchState.completedSteps++;
		
				return object;
			} else {
				const reportModelInstance = getModelInstance(provider, modelId, 'REPORT'); 

				const { text, usage } = await generateText({
					model: reportModelInstance,
					prompt,
					system,
				});
		
				researchState.tokenUsed += usage.totalTokens;
				researchState.completedSteps++;
				
				return text
			}
		}
		catch(error){
			attempts++;
			lastError = error instanceof Error ? error : new Error('Unknown error');

			if (attempts < MAX_RETRY_ATTEMPTS){
				activityTracker.add(activityType, 'warning', `Model call failed, attempt ${attempts}/${MAX_RETRY_ATTEMPTS}. Retrying...`)
			}
			await delay(RETRY_DELAY_MS*attempts)
		}
	}

	throw lastError || new Error(`Failed after ${MAX_RETRY_ATTEMPTS} attempts!`)
}
