'use-client'

import { useDeepResearchStore } from '@/store/deepResearch'
import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { Clock } from 'lucide-react'

const formatTime = (timeMs: number): string => {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const ms = Math.floor((timeMs % 1000) / 10);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else if (seconds > 0) {
    return `${seconds}.${ms.toString().padStart(2, '0')}s`;
  } else {
    return `0.${ms.toString().padStart(2, '0')}s`;
  }
};

const ResearchTimer = () => {
    const { report, isCompleted, activities } = useDeepResearchStore();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (report.length > 10) {
            setIsActive(false);
            return;
        }

        const startTime = Date.now();
        const timer = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 50); 

        return () => clearInterval(timer);
    }, [report, isCompleted]);

    if (activities.length <= 0) return null;

    const displayTime = formatTime(elapsedTime);
    const completedActivities = activities.filter(a => a.status === "complete").length;
    const totalActivities = activities.length;
    const progressPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    return (
        <Card className="p-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm rounded-xl mb-6 w-full">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Clock className={`h-5 w-5 text-blue-600 ${isActive ? 'animate-pulse' : ''}`} />
                </div>
                
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-900">
                            {isActive ? 'Research in Progress' : 'Research Complete'}
                        </h3>
                        <span className="text-sm font-mono text-slate-700 tabular-nums">
                            {displayTime}
                        </span>
                    </div>
                    
                    <div className="mt-2">
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div 
                                className="h-1.5 rounded-full bg-blue-500 transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-slate-500">
                                {completedActivities} of {totalActivities} tasks completed
                            </span>
                            <span className="text-xs font-medium text-slate-600">
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default ResearchTimer