'use client'

import React, { useState } from 'react'
import { Search, Building2 } from 'lucide-react'

interface CompanySearchProps {
  onSearch: (companyName: string) => void
}

export default function CompanySearch({ onSearch }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim())
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="기업명을 입력하세요 (예: 삼성전자, SK하이닉스, 현대자동차)"
            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <Search className="h-5 w-5 text-gray-400 hover:text-white transition-colors duration-200" />
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          💡 팁: 정확한 기업명을 입력하면 더 정확한 결과를 얻을 수 있습니다
        </p>
      </div>
    </div>
  )
} 