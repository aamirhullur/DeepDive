import React from 'react';
import { DeepSeek, Gemini, OpenAI, OpenRouter } from '@lobehub/icons';

export type ModelProvider = "gemini" | "openai" | "openrouter" | "deepseek";

export type ModelCapability = "vision" | "web" | "files" | "reasoning";

export interface Model {
  id: string;
  name: string;
  isNew?: boolean;
  isDegraded?: boolean;
  capabilities?: ModelCapability[];
  provider: ModelProvider;
  apiIdentifier: string; 
}

export interface Provider {
  id: ModelProvider;
  name: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  models: Model[];
}

export type TaskType = "PLANNING" | "EXTRACT" | "ANALYZE" | "REPORT";

export interface TaskModelMap {
  PLANNING: Record<ModelProvider, string | undefined>;
  EXTRACT: Record<ModelProvider, string | undefined>;
  ANALYZE: Record<ModelProvider, string | undefined>;
  REPORT: Record<ModelProvider, string | undefined>;
}

export interface ProviderModelMap {
  gemini?: Record<string, string>;
  openai?: Record<string, string>;
  openrouter?: Record<string, string>;
  deepseek?: Record<string, string>;
}

export const modelProviders: Provider[] = [
	{
    id: "gemini",
    name: "Gemini",
    icon: <Gemini className="w-5 h-5" />,
    isEnabled: true,
    models: [
      // {
      //   id: "gemini-2.5-pro",
      //   name: "Gemini 2.5 Pro",
      //   // capabilities: ["vision", "web", "reasoning"],
      //   provider: "gemini",
      //   apiIdentifier: "gemini-2.5-pro-preview-05-06",
      // },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        isNew: false,
        // capabilities: ["reasoning"],
        provider: "gemini",
        apiIdentifier: "gemini-2.5-flash-preview-05-20",
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        // capabilities: ["vision", "web", "files", "reasoning"],
        provider: "gemini",
        apiIdentifier: "google/gemini-2.0-flash",
      }
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: <OpenAI className="w-5 h-5" />,
    isEnabled: true,
    models: [
      {
        id: "gpt-4.1",
        name: "GPT 4.1",
        // capabilities: ["vision", "web", "files", "reasoning"],
        isNew: false,
        provider: "openai",
        apiIdentifier: "gpt-4.1",
      },
      {
        id: "gpt-o4-mini",
        name: "GPT o4 Mini",
        // capabilities: ["web", "reasoning"],
        provider: "openai",
        apiIdentifier: "o4-mini",
      },
      {
        id: "gpt-4o",
        name: "GPT 4o",
        // capabilities: ["reasoning"],
        provider: "openai",
        apiIdentifier: "gpt-4o",
      }
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: <OpenRouter className="w-5 h-5" />,
    isEnabled: false,
    models: [
      {
        id: "openrouter-gemini-2.0-pro",
        name: "Gemini 2.0 Pro",
        // capabilities: ["reasoning"],
        provider: "openrouter",
        apiIdentifier: "google/gemini-2.5-pro-exp-03-25:free",
      },
      {
        id: "qwen",
        name: "Qwen-32B",
        provider: "openrouter",
        apiIdentifier: "qwen/qwq-32b:free",
      }
    ],
  },
  {
    id: "deepseek",
    name: "Deepseek",
    icon: <DeepSeek className="w-5 h-5" />,
    isEnabled: false, 
    models: [
      {
        id: "deepseek-r1",
        name: "Deepseek R1",
        // capabilities: ["vision", "reasoning"],
        provider: "deepseek",
        apiIdentifier: "deepseek/DeepSeek-R1",
      },
      {
        id: "deepseek-v3",
        name: "Deepseek V3",
        // capabilities: ["vision", "web", "files"],
        provider: "deepseek",
        apiIdentifier: "deepseek/DeepSeek-V3-0324",
      }
    ],
  }
];

export const taskModelMap: TaskModelMap = {
  PLANNING: {
    gemini: "gemini-2.0-flash-exp",
    openai: "gpt-4o",
    openrouter: "google/gemini-2.0-flash-lite-preview-02-05:free",
    deepseek: "deepseek/DeepSeek-V3-0324",
  },
  EXTRACT: {
    gemini: "gemini-2.0-flash-exp",
    openai: "gpt-4o",
    openrouter: "google/gemini-2.0-flash-lite-preview-02-05:free",
    deepseek: "deepseek/DeepSeek-V3-0324", 
  },
  ANALYZE: {
    gemini: "gemini-2.0-flash-exp",
    openai: "gpt-4o",
    openrouter: "google/gemini-2.0-flash-lite-preview-02-05:free",
    deepseek: "deepseek/DeepSeek-V3-0324",
  },
  REPORT: {
    gemini: "gemini-2.5-pro-exp-03-25",
    openai: "gpt-4o",
    openrouter: "google/gemini-2.0-flash-lite-preview-02-05:free",
    deepseek: "deepseek/DeepSeek-V3-0324", 
  },
};

export const getEnabledProviders = (): Provider[] => {
  return modelProviders.filter(provider => provider.isEnabled);
};

export const getModelById = (provider: ModelProvider, modelId: string): Model | undefined => {
  const providerData = modelProviders.find(p => p.id === provider);
  return providerData?.models.find(m => m.id === modelId);
};

export const getProviderModelMap = (): ProviderModelMap => {
  const map: ProviderModelMap = {};
  
  modelProviders.forEach(provider => {
    const providerId = provider.id;
    if (!map[providerId]) {
      map[providerId] = {};
    }
    
    provider.models.forEach(model => {
      if (map[providerId]) {
        map[providerId]![model.id] = model.apiIdentifier;
      }
    });
  });
  
  return map;
};