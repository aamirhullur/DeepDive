'use-client'

import { useDeepResearchStore } from '@/store/deepResearch'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import React, { ComponentPropsWithRef, useState } from 'react'
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';

import { 
  BookOpen, 
  Download, 
  FileText, 
  Loader2, 
  Copy, 
  CheckCircle2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism'

type CodeProps = ComponentPropsWithRef<"code"> & {
  inline?: boolean
}

const ResearchReport = () => {
  const { report, isCompleted, isLoading, topic } = useDeepResearchStore()
  const [copied, setCopied] = useState(false);
  
  const handleMarkdownDownload = () => {
    const content = report.split("<report>")[1].split("</report>")[0]
    const blob = new Blob([content], {type: "text/markdown"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-research-report.md`;
    document.body.appendChild(a);
    a.click()
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleCopyToClipboard = async () => {
    const content = report.split("<report>")[1].split("</report>")[0];
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (!report && isLoading) {
    return (
      <Card className="w-full shadow-sm bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-1 rounded-full opacity-30 bg-gradient-to-r from-primary to-blue-500 blur-md"></div>
            <div className="relative bg-white rounded-full h-16 w-16 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-medium text-slate-800 mb-2">Generating Research Report</h3>
          {/* <p className="text-base text-slate-500 max-w-md">
            Our AI is analyzing sources and compiling your comprehensive report on "{topic}"
          </p> */}
        </div>
      </Card>
    );
  }

  if (!report) return null;
  if (!isCompleted) return null;

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-sm bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-800">{topic}</CardTitle>
              <CardDescription className="text-slate-500">
                Research Report
              </CardDescription>
            </div>
          </div>
          
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-slate-600 border-slate-200"
                    onClick={handleCopyToClipboard}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Copy report to clipboard</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="text-slate-600 border-slate-200"
                    onClick={handleMarkdownDownload}
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Download as Markdown</p>
                </TooltipContent>
              </Tooltip>
              
              {/* <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Share2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Share</span>
              </Button> */}
            </div>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-50/80 to-transparent z-10"></div>
          
          {/* <div className="max-h-[calc(100vh-250px)] overflow-y-auto px-6 py-8"> */}
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto px-6 py-8">
            <article className="prose prose-slate prose-headings:font-medium prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:decoration-primary/30 prose-a:decoration-1 prose-a:underline-offset-2 hover:prose-a:decoration-primary/50 prose-pre:bg-slate-800/95 prose-pre:border prose-pre:border-slate-700/10 prose-pre:rounded-md prose-pre:shadow-sm max-w-none">
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({className, children, inline, ...props}: CodeProps){
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : "";

                    if (!inline && language){
                      const SyntaxHighlighterProps:SyntaxHighlighterProps = {
                        style: nightOwl,
                        language,
                        PreTag: "div",
                        children: String(children),
                        showLineNumbers: true,
                        wrapLines: true
                      }

                      return (
                        <div className="rounded-md overflow-hidden my-4">
                          <SyntaxHighlighter {...SyntaxHighlighterProps}/>
                        </div>
                      );
                    }

                    return (
                      <code className={`${className} px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm font-mono`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1({children, ...props}) {
                    return (
                      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-slate-900 pb-2 border-b border-slate-200" {...props}>
                        {children}
                      </h1>
                    );
                  },
                  h2({children, ...props}) {
                    return (
                      <h2 className="scroll-m-20 border-b border-slate-200 pb-2 text-3xl font-semibold tracking-tight text-slate-800 mt-10 first:mt-0" {...props}>
                        {children}
                      </h2>
                    );
                  },
                  blockquote({children, ...props}) {
                    return (
                      <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600" {...props}>
                        {children}
                      </blockquote>
                    );
                  },
                  table({children, ...props}) {
                    return (
                      <div className="my-6 w-full overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full border-collapse text-sm" {...props}>
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({children, ...props}) {
                    return (
                      <th className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-left font-medium text-slate-700" {...props}>
                        {children}
                      </th>
                    );
                  },
                  td({children, ...props}) {
                    return (
                      <td className="border-b border-slate-100 px-4 py-2 text-slate-700" {...props}>
                        {children}
                      </td>
                    );
                  }
                }}
              >
                {report.split("<report>")[1].split("</report>")[0]}
              </Markdown>
            </article>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        
        <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText className="h-4 w-4" />
            <span>Research report generated using AI</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-slate-500 hover:text-slate-900"
            onClick={() => document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Back to top
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResearchReport