'use client'

import React, { useState } from 'react'
import { TrendingUp, Shield, Zap, Activity, BarChart3, PieChart, Target } from 'lucide-react'
import CategoryChart from './CategoryChart'
import RadarChart from './RadarChart'
import FinancialMetrics from './FinancialMetrics'

interface FinancialData {
  idx_cl_nm: string
  idx_nm: string
  idx_val: number
}

interface FinancialDashboardProps {
  companyName: string
  data: FinancialData[]
}

export default function FinancialDashboard({ companyName, data }: FinancialDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const categories = ['수익성', '안정성', '성장성', '활동성']
  const categoryIcons = {
    '수익성': <TrendingUp className="w-5 h-5" />,
    '안정성': <Shield className="w-5 h-5" />,
    '성장성': <Zap className="w-5 h-5" />,
    '활동성': <Activity className="w-5 h-5" />
  }

  const getCategoryData = (category: string) => {
    return data.filter(item => item.idx_cl_nm === category)
  }

  const calculateOverallScore = () => {
    const categoryScores = categories.map(category => {
      const categoryData = getCategoryData(category)
      if (categoryData.length === 0) return 0
      
      const avgScore = categoryData.reduce((sum, item) => sum + item.idx_val, 0) / categoryData.length
      
      // 카테고리별 정규화
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
    })
    
    return categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
  }

  const overallScore = calculateOverallScore()
  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A+', label: '매우우수', color: 'text-green-400' }
    if (score >= 70) return { grade: 'A', label: '우수', color: 'text-blue-400' }
    if (score >= 60) return { grade: 'B', label: '양호', color: 'text-yellow-400' }
    if (score >= 50) return { grade: 'C', label: '보통', color: 'text-orange-400' }
    return { grade: 'D', label: '개선필요', color: 'text-red-400' }
  }

  const gradeInfo = getGrade(overallScore)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {companyName} 재무 분석 리포트
        </h1>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{overallScore.toFixed(1)}</div>
            <div className="text-sm text-gray-400">종합점수</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
            <div className="text-sm text-gray-400">{gradeInfo.label}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="glass rounded-lg p-1">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: '종합 개요', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'categories', label: '카테고리별', icon: <PieChart className="w-4 h-4" /> },
              { id: 'radar', label: '레이더 차트', icon: <Target className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Category Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(category => {
                const categoryData = getCategoryData(category)
                const avgValue = categoryData.length > 0 
                  ? categoryData.reduce((sum, item) => sum + item.idx_val, 0) / categoryData.length 
                  : 0
                
                return (
                  <div key={category} className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-blue-400">{categoryIcons[category as keyof typeof categoryIcons]}</div>
                      <div className="text-2xl font-bold text-white">{avgValue.toFixed(1)}</div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{category}</h3>
                    <p className="text-sm text-gray-400">
                      {categoryData.length}개 지표 분석
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Financial Metrics */}
            <FinancialMetrics data={data} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            {categories.map(category => {
              const categoryData = getCategoryData(category)
              if (categoryData.length === 0) return null
              
              return (
                <div key={category} className="glass rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="text-blue-400">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{category} 지표</h2>
                  </div>
                  <CategoryChart data={categoryData} category={category} />
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="glass rounded-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">종합 재무건전성 레이더</h2>
              <p className="text-gray-400">4개 영역의 종합적인 재무 상태를 시각화합니다</p>
            </div>
            <RadarChart data={data} />
          </div>
        )}
      </div>
    </div>
  )
} 