'use client'

import React from 'react'
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'

interface FinancialData {
  idx_cl_nm: string
  idx_nm: string
  idx_val: number
}

interface RadarChartProps {
  data: FinancialData[]
}

export default function RadarChart({ data }: RadarChartProps) {
  const categories = ['수익성', '안정성', '성장성', '활동성']
  
  const calculateCategoryScore = (category: string) => {
    const categoryData = data.filter(item => item.idx_cl_nm === category)
    if (categoryData.length === 0) return 0
    
    const avgScore = categoryData.reduce((sum, item) => sum + item.idx_val, 0) / categoryData.length
    
    // 카테고리별 정규화 (0-100 스케일)
    switch (category) {
      case '수익성':
        return Math.min(100, Math.max(0, avgScore * 5))
      case '안정성':
        return Math.min(100, Math.max(0, avgScore / 2))
      case '성장성':
        return Math.min(100, Math.max(0, (avgScore + 20) * 2.5))
      case '활동성':
        return Math.min(100, Math.max(0, avgScore * 20))
      default:
        return Math.min(100, Math.max(0, avgScore))
    }
  }

  const chartData = categories.map(category => ({
    category: category,
    score: calculateCategoryScore(category)
  }))

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={500}>
        <RechartsRadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: '#9CA3AF', fontSize: 14, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={false}
          />
          <Radar
            name="재무건전성"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            strokeWidth={3}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Score Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item, index) => (
          <div key={index} className="glass rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-white mb-1">
              {item.category}
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {item.score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">
              / 100점
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Assessment */}
      <div className="glass rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-4">종합 평가</h3>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">평균 점수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {getOverallGrade(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length)}
            </div>
            <div className="text-sm text-gray-400">등급</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getOverallGrade(score: number): string {
  if (score >= 80) return 'A+'
  if (score >= 70) return 'A'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  return 'D'
} 