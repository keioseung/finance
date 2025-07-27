import { NextRequest, NextResponse } from 'next/server'

const API_KEY = "e7153f9582f89deb2169769816dcc61c826bd5cf"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')

    if (!company) {
      return NextResponse.json(
        { error: '회사명이 필요합니다.' },
        { status: 400 }
      )
    }

    // 1. corpCode.zip 다운로드 및 압축 해제
    const corpCodeResponse = await fetch(
      `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${API_KEY}`
    )
    
    if (!corpCodeResponse.ok) {
      return NextResponse.json(
        { error: '기업 코드 다운로드에 실패했습니다.' },
        { status: 500 }
      )
    }

    const corpCodeBuffer = await corpCodeResponse.arrayBuffer()
    
    // 2. 회사명으로 corp_code 검색
    const corpCode = await findCorpCode(corpCodeBuffer, company)
    
    if (!corpCode) {
      return NextResponse.json(
        { error: `'${company}'에 해당하는 기업을 찾을 수 없습니다.` },
        { status: 404 }
      )
    }

    // 3. 재무지표 데이터 가져오기
    const financialData = await fetchFinancialData(corpCode)

    return NextResponse.json(financialData)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function findCorpCode(buffer: ArrayBuffer, companyName: string): Promise<string | null> {
  // XML 파싱을 위한 간단한 구현
  const text = new TextDecoder().decode(buffer)
  
  // 정확한 매칭 시도
  const exactMatch = text.match(new RegExp(`<corp_name>${companyName}</corp_name>\\s*<corp_code>([^<]+)</corp_code>`))
  if (exactMatch) {
    return exactMatch[1]
  }
  
  // 부분 매칭 시도
  const partialMatch = text.match(new RegExp(`<corp_name>([^<]*${companyName}[^<]*)</corp_name>\\s*<corp_code>([^<]+)</corp_code>`))
  if (partialMatch) {
    return partialMatch[2]
  }
  
  return null
}

async function fetchFinancialData(corpCode: string) {
  const idx_cl_codes = {
    "M210000": "수익성",
    "M220000": "안정성", 
    "M230000": "성장성",
    "M240000": "활동성"
  }

  const allData: any[] = []
  const year = "2023"
  const reprt_code = "11014" // 3분기 보고서

  for (const [code, name] of Object.entries(idx_cl_codes)) {
    try {
      const response = await fetch(
        `https://opendart.fss.or.kr/api/fnlttSinglIndx.json?crtfc_key=${API_KEY}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=${reprt_code}&idx_cl_code=${code}`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.status === "000" && data.list) {
          const processedData = data.list.map((item: any) => ({
            idx_cl_nm: name,
            idx_nm: item.idx_nm,
            idx_val: parseFloat(item.idx_val) || 0
          }))
          allData.push(...processedData)
        }
      }
    } catch (error) {
      console.error(`Error fetching ${name} data:`, error)
    }
  }

  return allData
} 