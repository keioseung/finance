import axios, { AxiosResponse } from 'axios'
import { FinancialData, CompanyInfo, ApiResponse } from '../types/financial'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finance-backend-kqrt.onrender.com'

console.log('🌐 API_BASE_URL:', API_BASE_URL)
console.log('🌐 NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL)

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
  (error: any) => {
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
      console.log('🔄 Using dummy data due to API error')
      // API 실패 시 더미 데이터 반환
      return getDummyFinancialData(company, year)
    }
  },

  async searchCompanies(query: string): Promise<CompanyInfo[]> {
    try {
      console.log('🔍 Searching companies with query:', query)
      
      const response = await apiClient.get('/companies/search', {
        params: { query }
      })
      
      console.log('📡 Raw API response:', response)
      console.log('📡 Response data:', response.data)
      console.log('📡 Response data type:', typeof response.data)
      
      // 완전히 안전한 처리 - 백엔드 응답이 ['삼성전자'] 형태임
      let companies: string[] = []
      
      // response.data.companies가 배열인 경우
      if (response.data && response.data.companies && Array.isArray(response.data.companies)) {
        companies = response.data.companies
        console.log('📡 Found companies in response.data.companies:', companies)
      }
      // response.data가 직접 배열인 경우 (예상치 못한 응답)
      else if (response.data && Array.isArray(response.data)) {
        companies = response.data
        console.log('📡 Found companies in response.data:', companies)
      }
      // 그 외의 경우는 더미 데이터 사용
      else {
        console.log('📡 No valid companies found in response, using dummy data')
        return getDummyCompanies(query)
      }
      
      console.log('📡 Final companies array:', companies)
      console.log('📡 Is companies array?', Array.isArray(companies))
      
      // 안전한 변환
      const result: CompanyInfo[] = []
      for (const company of companies) {
        if (typeof company === 'string' && company.trim()) {
          result.push({
            corp_code: '',
            corp_name: company.trim()
          })
        }
      }
      
      console.log('📡 Final result:', result)
      console.log('📡 Result length:', result.length)
      
      // 결과가 비어있으면 더미 데이터 사용
      if (result.length === 0) {
        console.log('📡 No valid companies after processing, using dummy data')
        return getDummyCompanies(query)
      }
      
      return result
    } catch (error) {
      console.error('❌ Failed to search companies:', error)
      console.log('🔄 Using dummy companies due to API error')
      return getDummyCompanies(query)
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

// 더미 데이터 함수들
function getDummyFinancialData(company: string, year: string): FinancialData[] {
  console.log(`🔄 Generating dummy financial data for ${company} (${year})`)
  
  return [
    {
      category: "수익성",
      indicator: "ROE",
      idx_val: 15.5,
      unit: "%"
    },
    {
      category: "수익성", 
      indicator: "ROA",
      idx_val: 8.2,
      unit: "%"
    },
    {
      category: "안정성",
      indicator: "부채비율", 
      idx_val: 45.3,
      unit: "%"
    },
    {
      category: "안정성",
      indicator: "유동비율",
      idx_val: 180.5,
      unit: "%"
    },
    {
      category: "성장성",
      indicator: "매출성장률",
      idx_val: 12.3,
      unit: "%"
    },
    {
      category: "성장성",
      indicator: "영업이익성장률",
      idx_val: 18.2,
      unit: "%"
    },
    {
      category: "활동성",
      indicator: "총자산회전율",
      idx_val: 2.1,
      unit: "회"
    },
    {
      category: "활동성",
      indicator: "재고자산회전율",
      idx_val: 4.5,
      unit: "회"
    }
  ]
}

function getDummyCompanies(query: string): CompanyInfo[] {
  console.log(`🔄 Generating dummy companies for query: ${query}`)
  
  const allCompanies = [
    "삼성전자", "현대자동차", "LG전자", "SK하이닉스", "삼성바이오로직스",
    "삼성SDI", "삼성생명", "삼성화재", "삼성증권", "삼성물산",
    "LG화학", "LG디스플레이", "LG유플러스", "LG생활건강", "LG이노텍",
    "SK텔레콤", "SK이노베이션", "SK바이오팜", "SK하이닉스", "SK증권",
    "현대모비스", "현대제철", "현대글로비스", "현대엔지니어링", "현대건설",
    "포스코", "포스코퓨처엠", "포스코홀딩스", "포스코인터내셔널", "포스코에너지"
  ]
  
  const matches = allCompanies.filter(company => 
    company.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10)
  
  return matches.map(company => ({
    corp_code: '',
    corp_name: company
  }))
}

export default apiClient 