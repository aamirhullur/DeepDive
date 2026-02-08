import { Activity, Sources } from "@/app/api/deep-research/types";
import { create } from "zustand";
import { ModelProvider, getEnabledProviders } from "@/config/models";

interface DeepResearchState {   
    topic: string,
    questions: string[],
    answers: string[],
    currentQuestion: number,
    isCompleted: boolean,
    isLoading: boolean,
    activities: Activity[],
    sources: Sources[],
    report: string,
    modelProvider: ModelProvider;
    modelId: string | null; 
    visitorId: string | null;
}

interface DeepResearchActions {   
    setTopic: (topic: string) => void,
    setQuestions: (questions: string[]) => void,
    setAnswers: (answers: string[]) => void,
    setCurrentQuestion: (index: number) => void,
    setIsCompleted: (isCompleted: boolean) => void,
    setIsLoading: (isLoading: boolean) => void,
    setActivities: (activities: Activity[]) => void,
    setSources: (sources: Sources[]) => void,
    setReport: (report: string) => void,
    setModelProvider: (provider: ModelProvider) => void,
    setSelectedModel: (provider: ModelProvider, modelId: string) => void; 
    setVisitorId: (id: string | null) => void;
}

const getDefaultProvider = (): ModelProvider => {
    const enabledProviders = getEnabledProviders();
    return enabledProviders.length > 0 ? enabledProviders[0].id : "gemini";
};

const getDefaultModelId = (provider: ModelProvider): string => {
    const providerData = getEnabledProviders().find(p => p.id === provider);
    return providerData?.models[0]?.id || "gemini-2.5-pro";
};

const defaultProvider = getDefaultProvider();

const initialState: DeepResearchState = {
    topic: "",
    questions: [],
    answers: [],
    currentQuestion: 0,
    isCompleted: false,
    isLoading: false,
    activities: [],
    sources: [],
    report: "",
    modelProvider: defaultProvider,
    modelId: getDefaultModelId(defaultProvider),
    visitorId: null,
}

export const useDeepResearchStore = create<DeepResearchState & DeepResearchActions>((set) => ({
    ...initialState,
    setTopic: (topic: string) => set({ topic }),
    setQuestions: (questions: string[]) => set({ questions }),
    setAnswers: (answers: string[]) => set({ answers }),
    setCurrentQuestion: (currentQuestion: number) => set({ currentQuestion }),
    setIsCompleted: (isCompleted: boolean) => set({ isCompleted }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setActivities: (activities: Activity[]) => set({ activities }),
    setSources: (sources: Sources[]) => set({ sources }),
    setReport: (report: string) => set({ report }),
    setModelProvider: (modelProvider: ModelProvider) => set({ modelProvider }), 
    setSelectedModel: (provider: ModelProvider, modelId: string) => set({ modelProvider: provider, modelId: modelId }),
    setVisitorId: (visitorId: string|null) => set({ visitorId }),
}));
