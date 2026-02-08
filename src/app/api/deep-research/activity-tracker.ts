import { Activity, ResearchState } from "./types";

interface DataStream {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeData: (value: any) => void;
}

export const createActivityTracker = (dataStream: DataStream, researchState: ResearchState) => {

    return {
        add(type: Activity['type'], status: Activity['status'] ,message:Activity['message']) {
            dataStream.writeData({
                type: "activity",
                content: {
                    type,
                    status,
                    message,
                    timestamp: Date.now(),
                    completionSteps: researchState.completedSteps,
                    tokenUsed: researchState.tokenUsed 
                }
            })
        }
    }
}

