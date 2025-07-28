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
API_KEY = "e7153f9582f89deb2169769816dcc61c826bd5cf"

@app.get("/")
async def root():
    return {"message": "Finance Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "port": os.getenv("PORT", "8000")}

@app.get("/companies/search")
async def search_companies(query: str = Query(..., description="검색어")):
    """기업 검색"""
    try:
        # DART API에서 기업 코드 다운로드
        url = f"https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key={API_KEY}"
        response = requests.get(url)
        
        if response.status_code != 200:
            return {"companies": []}
        
        # ZIP 파일에서 기업 목록 추출
        with zipfile.ZipFile(io.BytesIO(response.content), 'r') as zip_ref:
            xml_file = None
            for file_info in zip_ref.filelist:
                if file_info.filename.endswith('CORPCODE.xml'):
                    xml_file = file_info.filename
                    break
            
            if not xml_file:
                return {"companies": []}
            
            with zip_ref.open(xml_file) as xml_content:
                tree = ET.parse(xml_content)
                root = tree.getroot()
                
                matches = []
                for item in root.iter("list"):
                    name = item.find("corp_name")
                    if name is not None and query.lower() in name.text.lower():
                        matches.append(name.text)
                        if len(matches) >= 10:  # 최대 10개 결과
                            break
                
                return {"companies": matches}
                
    except Exception as e:
        print(f"기업 검색 오류: {e}")
        return {"companies": []}

@app.get("/financial-data")
async def get_financial_data(company: str = Query(..., description="기업명"), year: str = Query("2023", description="연도")):
    """재무지표 데이터 조회"""
    try:
        # 임시 데이터 반환 (실제 API 구현 전)
        return [
            {
                "category": "재무상태표",
                "indicator": "자산총계",
                "value": 1000000,
                "unit": "백만원"
            },
            {
                "category": "재무상태표", 
                "indicator": "부채총계",
                "value": 500000,
                "unit": "백만원"
            },
            {
                "category": "수익성",
                "indicator": "ROE",
                "value": 15.5,
                "unit": "%"
            }
        ]
    except Exception as e:
        print(f"재무 데이터 조회 오류: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting backend on {host}:{port}")
    uvicorn.run(app, host=host, port=port) 