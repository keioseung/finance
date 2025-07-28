import axios, { AxiosResponse } from 'axios'
import { FinancialData, CompanyInfo, ApiResponse } from '../types/financial'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response?.status === 404) {
      throw new Error('요청한 데이터를 찾을 수 없습니다.')
    } else if (error.response?.status === 500) {
      throw new Error('서버 오류가 발생했습니다.')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('요청 시간이 초과되었습니다.')
    } else if (!error.response) {
      throw new Error('네트워크 연결을 확인해주세요.')
    }
    
    throw new Error(error.response?.data?.message || '알 수 없는 오류가 발생했습니다.')
  }
)

export const financialApi = {
  async getFinancialData(company: string, year: string = '2023'): Promise<FinancialData[]> {
    try {
      const response = await apiClient.get<FinancialData[]>('/financial-data', {
        params: { company, year }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
      throw error
    }
  },

  async searchCompanies(query: string): Promise<CompanyInfo[]> {
    try {
      const response = await apiClient.get<CompanyInfo[]>('/companies/search', {
        params: { query }
      })
      return response.data
    } catch (error) {
      console.error('Failed to search companies:', error)
      throw error
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health')
      return response.status === 200
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

export default apiClient 