'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { CompanyInfo } from '../types/financial'
import { financialApi } from '../services/api'

interface CompanySearchProps {
  onSearch: (companyName: string) => void
}

export default function CompanySearch({ onSearch }: CompanySearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<CompanyInfo[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 검색 제안 가져오기
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const companies = await financialApi.searchCompanies(searchQuery)
      // companies가 배열인지 확인하고 안전하게 처리
      const companiesArray = Array.isArray(companies) ? companies : []
      setSuggestions(companiesArray.slice(0, 10)) // 최대 10개만 표시
      setShowSuggestions(companiesArray.length > 0)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // 디바운스된 검색
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, fetchSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (company: CompanyInfo) => {
    setQuery(company.corp_name)
    setShowSuggestions(false)
    onSearch(company.corp_name)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setShowSuggestions(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="기업명을 입력하세요 (예: 삼성전자, 현대자동차)"
            className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <button
          type="submit"
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          재무지표 분석하기
        </button>
      </form>

      {/* 검색 제안 */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              검색 중...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((company, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(company)}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-white border-b border-white/10 last:border-b-0"
                  >
                    {company.corp_name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 