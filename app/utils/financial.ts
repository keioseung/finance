import { FinancialData, FinancialMetrics, ChartData } from '../types/financial'

export const formatNumber = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || !isFinite(value)) return 'N/A'
  
  if (Math.abs(value) >= 1e12) {
    return (value / 1e12).toFixed(decimals) + 'T'
  } else if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(decimals) + 'B'
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(decimals) + 'M'
  } else if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(decimals) + 'K'
  }
  
  return value.toFixed(decimals)
}

export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || !isFinite(value)) return 'N/A'
  return `${value.toFixed(decimals)}%`
}

export const calculateFinancialMetrics = (data: FinancialData[]): FinancialMetrics => {
  const metrics: FinancialMetrics = {
    profitability: {
      roe: 0,
      roa: 0,
      netProfitMargin: 0
    },
    stability: {
      debtRatio: 0,
      currentRatio: 0,
      quickRatio: 0
    },
    growth: {
      revenueGrowth: 0,
      assetGrowth: 0,
      equityGrowth: 0
    },
    activity: {
      assetTurnover: 0,
      inventoryTurnover: 0,
      receivableTurnover: 0
    }
  }

  data.forEach(item => {
    const value = item.idx_val
    const name = item.idx_nm.toLowerCase()
    
    // 수익성 지표
    if (name.includes('roe') || name.includes('자기자본이익률')) {
      metrics.profitability.roe = value
    } else if (name.includes('roa') || name.includes('총자산이익률')) {
      metrics.profitability.roa = value
    } else if (name.includes('순이익률') || name.includes('net profit margin')) {
      metrics.profitability.netProfitMargin = value
    }
    
    // 안정성 지표
    else if (name.includes('부채비율') || name.includes('debt ratio')) {
      metrics.stability.debtRatio = value
    } else if (name.includes('유동비율') || name.includes('current ratio')) {
      metrics.stability.currentRatio = value
    } else if (name.includes('당좌비율') || name.includes('quick ratio')) {
      metrics.stability.quickRatio = value
    }
    
    // 성장성 지표
    else if (name.includes('매출성장률') || name.includes('revenue growth')) {
      metrics.growth.revenueGrowth = value
    } else if (name.includes('자산성장률') || name.includes('asset growth')) {
      metrics.growth.assetGrowth = value
    } else if (name.includes('자본성장률') || name.includes('equity growth')) {
      metrics.growth.equityGrowth = value
    }
    
    // 활동성 지표
    else if (name.includes('총자산회전율') || name.includes('asset turnover')) {
      metrics.activity.assetTurnover = value
    } else if (name.includes('재고자산회전율') || name.includes('inventory turnover')) {
      metrics.activity.inventoryTurnover = value
    } else if (name.includes('매출채권회전율') || name.includes('receivable turnover')) {
      metrics.activity.receivableTurnover = value
    }
  })

  return metrics
}

export const createChartData = (metrics: FinancialMetrics): ChartData[] => {
  return [
    { name: 'ROE', value: metrics.profitability.roe, color: '#3B82F6' },
    { name: 'ROA', value: metrics.profitability.roa, color: '#10B981' },
    { name: '순이익률', value: metrics.profitability.netProfitMargin, color: '#F59E0B' },
    { name: '부채비율', value: metrics.stability.debtRatio, color: '#EF4444' },
    { name: '유동비율', value: metrics.stability.currentRatio, color: '#8B5CF6' },
    { name: '총자산회전율', value: metrics.activity.assetTurnover, color: '#06B6D4' }
  ]
}

export const getMetricStatus = (value: number, metricType: 'profitability' | 'stability' | 'growth' | 'activity'): 'good' | 'warning' | 'poor' => {
  if (isNaN(value) || !isFinite(value)) return 'warning'
  
  switch (metricType) {
    case 'profitability':
      return value > 10 ? 'good' : value > 5 ? 'warning' : 'poor'
    case 'stability':
      return value < 200 ? 'good' : value < 300 ? 'warning' : 'poor'
    case 'growth':
      return value > 10 ? 'good' : value > 5 ? 'warning' : 'poor'
    case 'activity':
      return value > 1 ? 'good' : value > 0.5 ? 'warning' : 'poor'
    default:
      return 'warning'
  }
}

export const getStatusColor = (status: 'good' | 'warning' | 'poor'): string => {
  switch (status) {
    case 'good':
      return '#10B981'
    case 'warning':
      return '#F59E0B'
    case 'poor':
      return '#EF4444'
    default:
      return '#6B7280'
  }
} 