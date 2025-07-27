'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text = '데이터를 불러오는 중...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-purple-600 rounded-full animate-spin absolute top-0 left-0`} 
             style={{ animationDelay: '0.5s' }}></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-400 text-center animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
} 