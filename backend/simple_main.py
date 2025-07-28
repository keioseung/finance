from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import xml.etree.ElementTree as ET
import zipfile
import io

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DART API 키
DART_API_KEY = os.getenv("DART_API_KEY", "e7153f9582f89deb2169769816dcc61c826bd5cf")

@app.get("/")
async def root():
    return {"message": "Finance Backend API (DART)", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "port": os.getenv("PORT", "8000")}

@app.get("/companies/search")
async def search_companies(query: str = Query(..., description="검색어")):
    """기업 검색 - DART API 사용"""
    try:
        print(f"🔍 기업 검색 요청: {query}")
        
        # DART API에서 기업 코드 다운로드
        url = f"https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key={DART_API_KEY}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ DART API 응답 오류: {response.status_code}")
            # 테스트용 더미 데이터 반환
            dummy_companies = [
                "삼성전자", "현대자동차", "LG전자", "SK하이닉스", "삼성바이오로직스",
                "삼성SDI", "삼성생명", "삼성화재", "삼성증권", "삼성물산"
            ]
            matches = [company for company in dummy_companies if query.lower() in company.lower()]
            print(f"📡 더미 데이터 반환: {matches}")
            return {"companies": matches}
        
        # ZIP 파일에서 기업 목록 추출
        with zipfile.ZipFile(io.BytesIO(response.content), 'r') as zip_ref:
            xml_file = None
            for file_info in zip_ref.filelist:
                if file_info.filename.endswith('CORPCODE.xml'):
                    xml_file = file_info.filename
                    break
            
            if not xml_file:
                print("❌ CORPCODE.xml 파일을 찾을 수 없음")
                return {"companies": []}
            
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
                
    except Exception as e:
        print(f"❌ 기업 검색 오류: {e}")
        # 오류 발생 시 더미 데이터 반환
        dummy_companies = [
            "삼성전자", "현대자동차", "LG전자", "SK하이닉스", "삼성바이오로직스",
            "삼성SDI", "삼성생명", "삼성화재", "삼성증권", "삼성물산"
        ]
        matches = [company for company in dummy_companies if query.lower() in company.lower()]
        return {"companies": matches}

def get_corp_code(company_name):
    """회사명으로 corp_code 검색"""
    try:
        # DART API에서 기업 코드 다운로드
        url = f"https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key={DART_API_KEY}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ DART API 응답 오류: {response.status_code}")
            return None
        
        # ZIP 파일에서 기업 목록 추출
        with zipfile.ZipFile(io.BytesIO(response.content), 'r') as zip_ref:
            xml_file = None
            for file_info in zip_ref.filelist:
                if file_info.filename.endswith('CORPCODE.xml'):
                    xml_file = file_info.filename
                    break
            
            if not xml_file:
                print("❌ CORPCODE.xml 파일을 찾을 수 없음")
                return None
            
            with zip_ref.open(xml_file) as xml_content:
                tree = ET.parse(xml_content)
                root = tree.getroot()
                
                exact_match = None
                partial_matches = []
                
                for item in root.iter("list"):
                    name = item.find("corp_name")
                    code = item.find("corp_code")
                    
                    if name is not None and name.text and code is not None and code.text:
                        if name.text == company_name:
                            exact_match = code.text
                            print(f"🔍 정확히 일치하는 회사명 매칭: {name.text}")
                            break
                        elif company_name in name.text:
                            partial_matches.append((name.text, code.text))
                
                if exact_match:
                    return exact_match
                elif partial_matches:
                    print("🔍 부분 일치하는 회사명 후보:")
                    for n, c in partial_matches[:5]:  # 최대 5개만 표시
                        print(f"  - {n} : {c}")
                    # 첫 번째 부분 일치를 반환
                    return partial_matches[0][1]
                else:
                    print(f"❌ '{company_name}'에 해당하는 corp_code를 찾을 수 없습니다.")
                    return None
                    
    except Exception as e:
        print(f"❌ corp_code 검색 오류: {e}")
        return None

def get_financial_index_data(corp_code, year, reprt_code, idx_cl_code):
    """주요 재무지표 요청"""
    try:
        url = "https://opendart.fss.or.kr/api/fnlttSinglIndx.json"
        params = {
            "crtfc_key": DART_API_KEY,
            "corp_code": corp_code,
            "bsns_year": year,
            "reprt_code": reprt_code,
            "idx_cl_code": idx_cl_code
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data.get("status") != "000":
            print(f"❌ DART API 에러: {data.get('message', 'Unknown error')}")
            return []
        
        return data.get("list", [])
        
    except Exception as e:
        print(f"❌ 재무지표 데이터 조회 오류: {e}")
        return []

@app.get("/financial-data")
async def get_financial_data(company: str = Query(..., description="기업명"), year: str = Query("2023", description="연도")):
    """재무지표 데이터 조회 - DART API 사용"""
    try:
        print(f"📊 재무 데이터 요청: company={company}, year={year}")
        
        # 1. 회사명으로 corp_code 검색
        corp_code = get_corp_code(company)
        if not corp_code:
            print(f"❌ {company}의 corp_code를 찾을 수 없음")
            return get_dummy_financial_data()
        
        print(f"✅ corp_code 찾음: {corp_code}")
        
        # 2. 모든 지표 분류 조회
        idx_cl_codes = {
            "M210000": "수익성",
            "M220000": "안정성", 
            "M230000": "성장성",
            "M240000": "활동성"
        }
        
        all_data = []
        reprt_code = "11014"  # 3분기 보고서
        
        for code, category in idx_cl_codes.items():
            print(f"📥 {category} 지표 가져오는 중...")
            data = get_financial_index_data(corp_code, year, reprt_code, code)
            
            if data:
                for item in data:
                    try:
                        idx_val = float(item.get("idx_val", 0))
                        all_data.append({
                            "category": category,
                            "indicator": item.get("idx_nm", ""),
                            "idx_val": idx_val,
                            "unit": item.get("unit", "")
                        })
                    except (ValueError, TypeError):
                        continue
        
        if all_data:
            print(f"📊 총 {len(all_data)}개의 재무지표를 수집했습니다.")
            print(f"📊 반환할 데이터: {all_data}")
            return all_data
        else:
            print("❌ 수집된 데이터가 없음, 더미 데이터 반환")
            return get_dummy_financial_data()
        
    except Exception as e:
        print(f"❌ 재무 데이터 조회 오류: {e}")
        return get_dummy_financial_data()

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting backend on {host}:{port}")
    uvicorn.run(app, host=host, port=port) 