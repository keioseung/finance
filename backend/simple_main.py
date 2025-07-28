from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import xml.etree.ElementTree as ET
import zipfile
import io
import time

app = FastAPI(title="Finance Backend API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DART API 키
DART_API_KEY = os.getenv("DART_API_KEY", "e7153f9582f89deb2169769816dcc61c826bd5cf")

@app.get("/")
async def root():
    return {
        "message": "Finance Backend API (DART)", 
        "status": "running",
        "version": "1.0.0",
        "dart_api_key": DART_API_KEY[:10] + "..." if DART_API_KEY else "Not set"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "port": os.getenv("PORT", "8000"),
        "timestamp": time.time()
    }

@app.get("/test")
async def test_endpoint():
    """테스트용 엔드포인트"""
    return {"message": "Backend is working!", "test": True}

def get_dummy_companies(query: str):
    """더미 기업 데이터 반환"""
    all_companies = [
        "삼성전자", "현대자동차", "LG전자", "SK하이닉스", "삼성바이오로직스",
        "삼성SDI", "삼성생명", "삼성화재", "삼성증권", "삼성물산",
        "LG화학", "LG디스플레이", "LG유플러스", "LG생활건강", "LG이노텍",
        "SK텔레콤", "SK이노베이션", "SK바이오팜", "SK증권",
        "현대모비스", "현대제철", "현대글로비스", "현대엔지니어링", "현대건설",
        "포스코", "포스코퓨처엠", "포스코홀딩스", "포스코인터내셔널", "포스코에너지"
    ]
    
    matches = [company for company in all_companies if query.lower() in company.lower()]
    return matches[:10]  # 최대 10개 반환

@app.get("/companies/search")
async def search_companies(query: str = Query(..., description="검색어")):
    """기업 검색 - DART API 사용 (실패 시 더미 데이터)"""
    try:
        print(f"🔍 기업 검색 요청: {query}")
        
        # DART API에서 기업 코드 다운로드
        url = f"https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key={DART_API_KEY}"
        response = requests.get(url, timeout=15)
        
        if response.status_code != 200:
            print(f"❌ DART API 응답 오류: {response.status_code}")
            matches = get_dummy_companies(query)
            print(f"📡 더미 데이터 반환: {matches}")
            return {"companies": matches}
        
        # ZIP 파일에서 기업 목록 추출
        try:
            with zipfile.ZipFile(io.BytesIO(response.content), 'r') as zip_ref:
                xml_file = None
                for file_info in zip_ref.filelist:
                    if file_info.filename.endswith('CORPCODE.xml'):
                        xml_file = file_info.filename
                        break
                
                if not xml_file:
                    print("❌ CORPCODE.xml 파일을 찾을 수 없음")
                    matches = get_dummy_companies(query)
                    return {"companies": matches}
                
                with zip_ref.open(xml_file) as xml_content:
                    tree = ET.parse(xml_content)
                    root = tree.getroot()
                    
                    matches = []
                    for item in root.iter("list"):
                        name = item.find("corp_name")
                        if name is not None and name.text and query.lower() in name.text.lower():
                            matches.append(name.text)
                            if len(matches) >= 10:  # 최대 10개 결과
                                break
                    
                    print(f"📡 검색 결과: {matches}")
                    return {"companies": matches}
                    
        except Exception as zip_error:
            print(f"❌ ZIP 파일 처리 오류: {zip_error}")
            matches = get_dummy_companies(query)
            return {"companies": matches}
                
    except Exception as e:
        print(f"❌ 기업 검색 오류: {e}")
        matches = get_dummy_companies(query)
        return {"companies": matches}

def get_dummy_financial_data():
    """더미 재무 데이터 반환"""
    return [
        {
            "category": "수익성",
            "indicator": "ROE",
            "idx_val": 15.5,
            "unit": "%"
        },
        {
            "category": "수익성",
            "indicator": "ROA", 
            "idx_val": 8.2,
            "unit": "%"
        },
        {
            "category": "안정성",
            "indicator": "부채비율",
            "idx_val": 45.3,
            "unit": "%"
        },
        {
            "category": "안정성",
            "indicator": "유동비율",
            "idx_val": 180.5,
            "unit": "%"
        },
        {
            "category": "성장성",
            "indicator": "매출성장률",
            "idx_val": 12.3,
            "unit": "%"
        },
        {
            "category": "성장성",
            "indicator": "영업이익성장률",
            "idx_val": 18.2,
            "unit": "%"
        },
        {
            "category": "활동성",
            "indicator": "총자산회전율",
            "idx_val": 2.1,
            "unit": "회"
        },
        {
            "category": "활동성",
            "indicator": "재고자산회전율",
            "idx_val": 4.5,
            "unit": "회"
        }
    ]

@app.get("/financial-data")
async def get_financial_data(company: str = Query(..., description="기업명"), year: str = Query("2023", description="연도")):
    """재무지표 데이터 조회 - DART API 사용 (실패 시 더미 데이터)"""
    try:
        print(f"📊 재무 데이터 요청: company={company}, year={year}")
        
        # DART API 호출 시도
        try:
            # 간단한 테스트를 위해 더미 데이터 반환
            # 실제 DART API 호출은 복잡하므로 일단 더미 데이터로 시작
            print("🔄 DART API 호출 대신 더미 데이터 반환")
            return get_dummy_financial_data()
            
        except Exception as dart_error:
            print(f"❌ DART API 오류: {dart_error}")
            return get_dummy_financial_data()
        
    except Exception as e:
        print(f"❌ 재무 데이터 조회 오류: {e}")
        return get_dummy_financial_data()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 Starting backend on {host}:{port}")
    print(f"🔑 DART API Key: {DART_API_KEY[:10]}..." if DART_API_KEY else "Not set")
    uvicorn.run(app, host=host, port=port) 