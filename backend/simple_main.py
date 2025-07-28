from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
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

# API 키들
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "XF29EJJK21TVCUDF")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "d23bhh9r01qgiro2upigd23bhh9r01qgiro2upj0")

@app.get("/")
async def root():
    return {
        "message": "Finance Backend API (Alpha Vantage + Finnhub)", 
        "status": "running",
        "version": "1.0.0",
        "alpha_vantage_key": ALPHA_VANTAGE_API_KEY[:10] + "..." if ALPHA_VANTAGE_API_KEY else "Not set",
        "finnhub_key": FINNHUB_API_KEY[:10] + "..." if FINNHUB_API_KEY else "Not set"
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
    """기업 검색 - Alpha Vantage API 사용"""
    try:
        print(f"🔍 기업 검색 요청: {query}")
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": query,
            "apikey": ALPHA_VANTAGE_API_KEY
        }
        response = requests.get(url, params=params, timeout=15)
        print(f"📡 Alpha Vantage API 응답 상태: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ Alpha Vantage API 응답 오류: {response.status_code}")
            matches = get_dummy_companies(query)
            print(f"📡 더미 데이터 반환: {matches}")
            return {"companies": matches}

        data = response.json()
        print(f"📡 Alpha Vantage API 응답: {data}")

        companies = []
        if "bestMatches" in data:
            for match in data["bestMatches"]:
                if "2. name" in match:
                    companies.append(match["2. name"])

        if not companies:
            companies = get_dummy_companies(query)

        print(f"📡 검색 결과: {companies}")
        return {"companies": companies[:10]}

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
    """재무지표 데이터 조회 - Alpha Vantage API 사용"""
    try:
        print(f"📊 재무 데이터 요청: company={company}, year={year}")
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "OVERVIEW",
            "symbol": company,
            "apikey": ALPHA_VANTAGE_API_KEY
        }
        response = requests.get(url, params=params, timeout=15)
        print(f"📡 Alpha Vantage API 응답 상태: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ Alpha Vantage API 응답 오류: {response.status_code}")
            return get_dummy_financial_data()

        data = response.json()
        print(f"📡 Alpha Vantage API 응답: {data}")

        financial_data = []
        if "ReturnOnEquityTTM" in data and data["ReturnOnEquityTTM"] != "None":
            financial_data.append({"category": "수익성", "indicator": "ROE", "idx_val": float(data["ReturnOnEquityTTM"]), "unit": "%"})
        if "ReturnOnAssetsTTM" in data and data["ReturnOnAssetsTTM"] != "None":
            financial_data.append({"category": "수익성", "indicator": "ROA", "idx_val": float(data["ReturnOnAssetsTTM"]), "unit": "%"})
        if "DebtToEquityRatio" in data and data["DebtToEquityRatio"] != "None":
            financial_data.append({"category": "안정성", "indicator": "부채비율", "idx_val": float(data["DebtToEquityRatio"]), "unit": "%"})
        if "RevenueGrowth" in data and data["RevenueGrowth"] != "None":
            financial_data.append({"category": "성장성", "indicator": "매출성장률", "idx_val": float(data["RevenueGrowth"]), "unit": "%"})
        if "AssetTurnover" in data and data["AssetTurnover"] != "None":
            financial_data.append({"category": "활동성", "indicator": "총자산회전율", "idx_val": float(data["AssetTurnover"]), "unit": "회"})

        if len(financial_data) < 4:
            dummy_data = get_dummy_financial_data()
            existing_categories = {item["category"] for item in financial_data}
            for item in dummy_data:
                if item["category"] not in existing_categories:
                    financial_data.append(item)

        print(f"📊 반환할 데이터: {financial_data}")
        return financial_data

    except Exception as e:
        print(f"❌ 재무 데이터 조회 오류: {e}")
        return get_dummy_financial_data()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 Starting backend on {host}:{port}")
    print(f"🔑 Alpha Vantage API Key: {ALPHA_VANTAGE_API_KEY[:10]}..." if ALPHA_VANTAGE_API_KEY else "Not set")
    print(f"🔑 Finnhub API Key: {FINNHUB_API_KEY[:10]}..." if FINNHUB_API_KEY else "Not set")
    uvicorn.run(app, host=host, port=port) 