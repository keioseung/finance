'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface FinancialData {
  idx_cl_nm: string
  idx_nm: string
  idx_val: number
}

interface FinancialMetricsProps {
  data: FinancialData[]
}

export default function FinancialMetrics({ data }: FinancialMetricsProps) {
  const categories = ['수익성', '안정성', '성장성', '활동성']
  
  const getCategoryData = (category: string) => {
    return data.filter(item => item.idx_cl_nm === category)
  }

  const getTopMetrics = (category: string, count: number = 3) => {
    const categoryData = getCategoryData(category)
    return categoryData
      .sort((a, b) => b.idx_val - a.idx_val)
      .slice(0, count)
  }

  const getInterpretation = (category: string, value: number) => {
    const interpretations = {
      "수익성": {
        "excellent": { threshold: 15, label: "💰 매우 우수", color: "text-green-400" },
        "good": { threshold: 10, label: "👍 양호", color: "text-blue-400" },
        "average": { threshold: 5, label: "⚖️ 보통", color: "text-yellow-400" },
        "poor": { threshold: 0, label: "⚠️ 개선필요", color: "text-red-400" }
      },
      "안정성": {
        "excellent": { threshold: 200, label: "🛡️ 매우 안정", color: "text-green-400" },
        "good": { threshold: 150, label: "✅ 안정", color: "text-blue-400" },
        "average": { threshold: 100, label: "⚖️ 보통", color: "text-yellow-400" },
        "poor": { threshold: 0, label: "⚠️ 불안정", color: "text-red-400" }
      },
      "성장성": {
        "excellent": { threshold: 20, label: "🚀 고성장", color: "text-green-400" },
        "good": { threshold: 10, label: "📈 성장", color: "text-blue-400" },
        "average": { threshold: 0, label: "⚖️ 보통", color: "text-yellow-400" },
        "poor": { threshold: -10, label: "📉 감소", color: "text-red-400" }
      },
      "활동성": {
        "excellent": { threshold: 5, label: "⚡ 매우 활발", color: "text-green-400" },
        "good": { threshold: 3, label: "🔄 활발", color: "text-blue-400" },
        "average": { threshold: 1, label: "⚖️ 보통", color: "text-yellow-400" },
        "poor": { threshold: 0, label: "🐌 저조", color: "text-red-400" }
      }
    }

    const criteria = interpretations[category as keyof typeof interpretations] || interpretations["수익성"]
    
    for (const [level, { threshold, label, color }] of Object.entries(criteria)) {
      if (value >= threshold) {
        return { label, color }
      }
    }
    
    return criteria.poor
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        주요 재무 지표 상세 분석
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map(category => {
          const topMetrics = getTopMetrics(category)
          const categoryData = getCategoryData(category)
          const avgValue = categoryData.length > 0 
            ? categoryData.reduce((sum, item) => sum + item.idx_val, 0) / categoryData.length 
            : 0
          
          return (
            <div key={category} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{category}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {avgValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">평균값</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {topMetrics.map((metric, index) => {
                  const interpretation = getInterpretation(category, metric.idx_val)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white mb-1">
                          {metric.idx_nm}
                        </div>
                        <div className="text-xs text-gray-400">
                          {interpretation.label}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(metric.idx_val)}
                        <div className="text-right">
                          <div className={`text-lg font-bold ${interpretation.color}`}>
                            {metric.idx_val.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {categoryData.length > 3 && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-400">
                    외 {categoryData.length - 3}개 지표 더보기
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          분석 요약
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(category => {
            const categoryData = getCategoryData(category)
            const avgValue = categoryData.length > 0 
              ? categoryData.reduce((sum, item) => sum + item.idx_val, 0) / categoryData.length 
              : 0
            const interpretation = getInterpretation(category, avgValue)
            
            return (
              <div key={category} className="text-center">
                <div className="text-lg font-semibold text-white mb-1">
                  {category}
                </div>
                <div className={`text-2xl font-bold ${interpretation.color}`}>
                  {avgValue.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {interpretation.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 