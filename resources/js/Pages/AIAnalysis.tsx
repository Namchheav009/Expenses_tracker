import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BrainIcon,
  SparklesIcon,
  Loader2Icon,
  CalendarIcon,
} from 'lucide-react'
import type { AIAnalysis as AIAnalysisType } from '../data/mockData'
interface AIAnalysisProps {
  analyses: AIAnalysisType[]
  onGenerate: () => void
}
export function AIAnalysis({ analyses, onGenerate }: AIAnalysisProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      onGenerate()
      setIsGenerating(false)
    }, 2000)
  }
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
          <BrainIcon className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg backdrop-blur-sm border border-emerald-500/30">
              <SparklesIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold">AI Financial Advisor</h1>
          </div>
          <p className="text-slate-300 max-w-xl mb-8 text-lg">
            Get personalized insights and recommendations based on your spending
            habits and budget goals.
          </p>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="w-5 h-5 animate-spin" />
                Analyzing your finances...
              </>
            ) : (
              <>
                <BrainIcon className="w-5 h-5" />
                Generate New Analysis
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 px-1">
          Previous Insights
        </h2>

        {analyses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">
              No analyses yet. Generate your first AI financial analysis!
            </p>
          </div>
        ) : (
          analyses
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((analysis, idx) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: idx * 0.1,
                }}
                key={analysis.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    {monthNames[analysis.month - 1]} {analysis.year} Analysis
                  </div>
                  <span className="text-xs text-slate-400">
                    Generated{' '}
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Data Analyzed
                    </h3>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm leading-relaxed">
                      {analysis.summaryText}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4" />
                      AI Recommendations
                    </h3>
                    <div className="prose prose-slate prose-sm max-w-none">
                      {analysis.aiResult.split('\n').map((paragraph, i) => (
                        <p
                          key={i}
                          className="text-slate-800 leading-relaxed mb-2"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
        )}
      </div>
    </motion.div>
  )
}
