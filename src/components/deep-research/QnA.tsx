"use client";
import { useDeepResearchStore } from "@/store/deepResearch";
import React, { useEffect } from "react";
import QuestionForm from "./QuestionForm";
import { useChat } from '@ai-sdk/react';
import ResearchActivities from "./ResearchActivities";
import ResearchReport from "./ResearchReport";
import ResearchTimer from "./ResearchTimer";
import CompletedQuestions from "./CompletedQuestions";

interface ActivityMessage {
    type: 'activity';
    content: {
        type: 'search' | 'extract' | 'analyze' | 'generate' | 'planning';
        status: 'pending' | 'complete' | 'warning' | 'error';
        message: string;
        timestamp: number;
        completionSteps: number;
        tokenUsed: number;
    };
}

interface ReportMessage {
    type: 'report';
    content: string;
}

type Message = ActivityMessage | ReportMessage;

const QnA = () => {
	const { questions, isCompleted, topic, answers, setIsLoading, setActivities, setSources, setReport, isLoading, modelProvider, modelId } = useDeepResearchStore();
    const { append, data } = useChat({
        api:"/api/deep-research"
    });

    useEffect(() => {
        if (!data) return;

        const messages = data as unknown[];
        const activities = messages.filter((msg): msg is ActivityMessage => 
            typeof msg === 'object' && msg !== null && (msg as Message).type === 'activity'
        ).map(msg => msg.content);

        setActivities(activities)
        const sources = activities.filter(activity => activity.type === 'extract' && activity.status === 'complete')
        .map(activity => {
            const url = activity.message.split("from ")[1]

            return {
                url,
                title: url?.split("/")[2] || url
            }
        })

        setSources(sources)
        const reportData = messages.find((msg): msg is ReportMessage => 
            typeof msg === 'object' && msg !== null && (msg as Message).type === 'report'
        )
        const report = reportData && typeof reportData.content === "string" ? reportData.content : ""
        setReport(report)

        setIsLoading(isLoading)
    }, [data, setActivities, setSources, setReport, setIsLoading, isLoading])

    useEffect(() => {
        if(isCompleted && questions.length > 0) {
            // Reset previous research data when starting new research
            setActivities([]);
            setSources([]);
            setReport("");
            
            const clarifications = questions.map((question, index) => ({
                question: question,
                answer: answers[index],
            }))

            append({
                role: "user",
                content: JSON.stringify({
                    topic: topic,
                    clarifications: clarifications,
                    modelProvider: modelProvider,
                    modelId: modelId, 
                })
            })
        }
    }, [isCompleted, questions, answers, topic, append, modelProvider, modelId, setActivities, setSources, setReport])

	return (
		<div className="w-full flex flex-col items-center mb-16">
            <div className="w-full max-w-3xl space-y-6">
                <QuestionForm />
                <CompletedQuestions />
            </div>
            
            <ResearchActivities />
            
            <div className="w-full max-w-3xl">
                <ResearchTimer />
            </div>
            
            <div className="w-full">
                <ResearchReport />
            </div>
		</div>
	);
};

export default QnA;
