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
      console.log('🔍 Searching companies with query:', query)
      
      const response = await apiClient.get<{companies: string[]}>('/companies/search', {
        params: { query }
      })
      
      console.log('📡 Raw API response:', response)
      console.log('📡 Response data:', response.data)
      console.log('📡 Response data type:', typeof response.data)
      console.log('📡 Companies array:', response.data.companies)
      console.log('📡 Companies array type:', typeof response.data.companies)
      console.log('📡 Is companies array?', Array.isArray(response.data.companies))
      
      // 백엔드 응답 형식에 맞게 변환
      const companies = response.data.companies || []
      console.log('📡 Processed companies:', companies)
      
      const result = companies.map(company => ({ 
        corp_code: '', // DART API에서 corp_code를 제공하지 않으므로 빈 문자열
        corp_name: company 
      }))
      
      console.log('📡 Final result:', result)
      console.log('📡 Result type:', typeof result)
      console.log('📡 Is result array?', Array.isArray(result))
      
      return result
    } catch (error) {
      console.error('❌ Failed to search companies:', error)
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