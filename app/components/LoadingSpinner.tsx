'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
      </div>
      <p className="mt-4 text-lg text-gray-300">재무 데이터를 분석하고 있습니다...</p>
      <div className="mt-2 flex space-x-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )
} 