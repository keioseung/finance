'use client'

import React, { useState, useCallback } from 'react'
import { Search, TrendingUp, Shield, Zap, Target, BarChart3, PieChart, Activity } from 'lucide-react'
import { FinancialData } from './types/financial'
import { financialApi } from './services/api'
import FinancialDashboard from './components/FinancialDashboard'
import CompanySearch from './components/CompanySearch'
import LoadingSpinner from './components/LoadingSpinner'

export default function Home() {
  const [companyName, setCompanyName] = useState('')
  const [financialData, setFinancialData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = useCallback(async (searchCompanyName: string) => {
    if (!searchCompanyName.trim()) {
      setError('기업명을 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')
    setCompanyName(searchCompanyName)

    try {
      const data = await financialApi.getFinancialData(searchCompanyName)
      setFinancialData(data)
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.')
      setFinancialData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleClearData = useCallback(() => {
    setCompanyName('')
    setFinancialData([])
    setError('')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Finance Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              DART API 기반 기업 재무지표 종합 분석 플랫폼
            </p>
            
            {/* Search Component */}
            <CompanySearch onSearch={handleSearch} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-red-400">{error}</p>
              <button
                onClick={handleClearData}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {financialData.length > 0 && !loading && (
          <FinancialDashboard 
            companyName={companyName} 
            data={financialData} 
          />
        )}

        {/* Features Section */}
        {!loading && financialData.length === 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              주요 기능
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="수익성 분석"
                description="ROE, ROA 등 수익성 지표를 통한 기업 가치 평가"
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="안정성 분석"
                description="부채비율, 유동비율 등 재무 안정성 지표 분석"
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="성장성 분석"
                description="매출성장률, 자산성장률 등 성장 잠재력 평가"
              />
              <FeatureCard
                icon={<Activity className="w-8 h-8" />}
                title="활동성 분석"
                description="자산회전율, 재고회전율 등 경영 효율성 분석"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Finance Dashboard. Powered by DART API.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-300">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
} 