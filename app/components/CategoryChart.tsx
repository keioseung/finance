'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface FinancialData {
  idx_cl_nm: string
  idx_nm: string
  idx_val: number
}

interface CategoryChartProps {
  data: FinancialData[]
  category: string
}

export default function CategoryChart({ data, category }: CategoryChartProps) {
  const chartData = data.map(item => ({
    name: item.idx_nm.replace('(', '\n('),
    value: item.idx_val,
    interpretation: getInterpretation(category, item.idx_nm, item.idx_val)
  }))

  const colors = {
    '수익성': ['#FF6B6B', '#FF8E8E', '#FFB1B1', '#FFD4D4'],
    '안정성': ['#4ECDC4', '#6ED7D0', '#8EE1DC', '#AEEBE8'],
    '성장성': ['#45B7D1', '#6AC5DB', '#8FD3E5', '#B4E1EF'],
    '활동성': ['#96CEB4', '#AAD8C2', '#BEE2D0', '#D2ECDE']
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#9CA3AF' }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: any, name: any, props: any) => [
              `${value.toFixed(2)}`,
              `${props.payload.interpretation}`
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[category as keyof typeof colors]?.[index % 4] || '#8884d8'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Interpretation Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item, index) => (
          <div key={index} className="glass rounded-lg p-3">
            <div className="text-sm font-medium text-white mb-1">
              {item.name.replace('\n', ' ')}
            </div>
            <div className="text-lg font-bold text-blue-400">
              {item.value.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {item.interpretation}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getInterpretation(category: string, metricName: string, value: number) {
  const interpretations = {
    "수익성": {
      "excellent": { threshold: 15, label: "💰 매우 우수" },
      "good": { threshold: 10, label: "👍 양호" },
      "average": { threshold: 5, label: "⚖️ 보통" },
      "poor": { threshold: 0, label: "⚠️ 개선필요" }
    },
    "안정성": {
      "excellent": { threshold: 200, label: "🛡️ 매우 안정" },
      "good": { threshold: 150, label: "✅ 안정" },
      "average": { threshold: 100, label: "⚖️ 보통" },
      "poor": { threshold: 0, label: "⚠️ 불안정" }
    },
    "성장성": {
      "excellent": { threshold: 20, label: "🚀 고성장" },
      "good": { threshold: 10, label: "📈 성장" },
      "average": { threshold: 0, label: "⚖️ 보통" },
      "poor": { threshold: -10, label: "📉 감소" }
    },
    "활동성": {
      "excellent": { threshold: 5, label: "⚡ 매우 활발" },
      "good": { threshold: 3, label: "🔄 활발" },
      "average": { threshold: 1, label: "⚖️ 보통" },
      "poor": { threshold: 0, label: "🐌 저조" }
    }
  }

  const criteria = interpretations[category as keyof typeof interpretations] || interpretations["수익성"]
  
  for (const [level, { threshold, label }] of Object.entries(criteria)) {
    if (value >= threshold) {
      return label
    }
  }
  
  return criteria.poor.label
} 