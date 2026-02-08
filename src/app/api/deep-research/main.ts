import { MAX_ITERATIONS } from "./constants";
import { analyzeFindings, generateReport, generateSearchQueries, processSearchResults, search } from "./research-functions";
import { ResearchState } from "./types";
import { createActivityTracker } from "./activity-tracker";

interface DataStream {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeData: (value: any) => void;
}

export async function deepResearch(researchState: ResearchState, dataStream: DataStream){

    let Iteration = 0

    const activityTracker = createActivityTracker(dataStream, researchState);
    
    const initialQueries = await generateSearchQueries(researchState,activityTracker)
    interface SearchQueryResult {
        searchQueries: string[];
    }
    let currentQueries = (initialQueries as SearchQueryResult).searchQueries


    while (currentQueries && currentQueries.length > 0 && Iteration < MAX_ITERATIONS){
        Iteration++

        console.log("We are running on iteration number:", Iteration);
        const searchResults = currentQueries.map((query:string) => search(query,researchState,activityTracker))
        const searchResultsResponses = await Promise.allSettled(searchResults)

        // const allSearchResults = searchResultsResponses.filter(result => result.status === 'fulfilled' && result.value.length > 0).map(result => result.value).flat()
        interface SearchResult {
            title: string;
            url: string;
            content: string;
        }
        const allSearchResults = searchResultsResponses.filter((result): result is PromiseFulfilledResult<SearchResult[]> => result.status === 'fulfilled' && result.value.length > 0).map(result => result.value).flat()

        console.log(`We got ${allSearchResults.length} search results!`)

        const newFindings = await processSearchResults(
            allSearchResults, researchState,activityTracker
        )
        
        console.log(`Results are processed!`)
        researchState.findings = [...researchState.findings, ...newFindings];


        const analysis = await analyzeFindings(
            researchState,
            activityTracker,
            currentQueries,
            Iteration
        )
        console.log("Analysis: ",analysis)
        interface AnalysisResult {
            sufficient: boolean;
            queries?: string[];
        }
        if((analysis as AnalysisResult).sufficient){
            break;
        }


        currentQueries = ((analysis as AnalysisResult).queries || []).filter((query:string) => !currentQueries.includes(query));
    }
    console.log("We are outside of the loop with total iterations: ", Iteration)
    console.log("Findings: ",researchState.findings)
    
    let report = null;
    try{
        report = await generateReport(researchState,activityTracker);
    } catch(err){
        console.log("Error generating report: ", err);
    }

    if (!report) {
        console.log("No report generated");
        report = "The research process could not generate a comprehensive report. Please try again with a different topic or clarifications.";
    }
    


    // const report = await generateReport(researchState,activityTracker);

    dataStream.writeData({
        type: "report",
        content: report
    })

    console.log("REPORT: ",report)
    return initialQueries;
}