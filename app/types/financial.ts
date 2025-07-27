export interface FinancialData {
  idx_cl_nm: string
  idx_nm: string
  idx_val: number
  unit?: string
}

export interface CompanyInfo {
  corp_code: string
  corp_name: string
}

export interface FinancialMetrics {
  profitability: {
    roe: number
    roa: number
    netProfitMargin: number
  }
  stability: {
    debtRatio: number
    currentRatio: number
    quickRatio: number
  }
  growth: {
    revenueGrowth: number
    assetGrowth: number
    equityGrowth: number
  }
  activity: {
    assetTurnover: number
    inventoryTurnover: number
    receivableTurnover: number
  }
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
} 