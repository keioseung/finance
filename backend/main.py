from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import xml.etree.ElementTree as ET
import zipfile
import io
import os
from typing import List, Dict, Any
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Finance Dashboard API",
    description="DART API 기반 재무지표 분석 백엔드",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DART API 키
API_KEY = "e7153f9582f89deb2169769816dcc61c826bd5cf"

class FinancialDataService:
    def __init__(self):
        self.api_key = API_KEY
        self.corp_code_cache = None
    
    async def download_corp_code(self) -> bytes:
        """기업 코드 다운로드"""
        url = f"https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key={self.api_key}"
        response = requests.get(url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="기업 코드 다운로드 실패")
        
        return response.content
    
    def extract_corp_code(self, zip_content: bytes, company_name: str) -> str:
        """ZIP 파일에서 기업 코드 추출"""
        try:
            with zipfile.ZipFile(io.BytesIO(zip_content), 'r') as zip_ref:
                # CORPCODE.xml 파일 찾기
                xml_file = None
                for file_info in zip_ref.filelist:
                    if file_info.filename.endswith('CORPCODE.xml'):
                        xml_file = file_info.filename
                        break
                
                if not xml_file:
                    raise HTTPException(status_code=500, detail="CORPCODE.xml 파일을 찾을 수 없습니다")
                
                # XML 파싱
                with zip_ref.open(xml_file) as xml_content:
                    tree = ET.parse(xml_content)
                    root = tree.getroot()
                    
                    # 정확한 매칭 시도
                    for item in root.iter("list"):
                        name = item.find("corp_name")
                        code = item.find("corp_code")
                        
                        if name is not None and code is not None:
                            if name.text == company_name:
                                logger.info(f"정확한 매칭: {company_name} -> {code.text}")
                                return code.text
                    
                    # 부분 매칭 시도
                    partial_matches = []
                    for item in root.iter("list"):
                        name = item.find("corp_name")
                        code = item.find("corp_code")
                        
                        if name is not None and code is not None and company_name in name.text:
                            partial_matches.append((name.text, code.text))
                    
                    if partial_matches:
                        logger.info(f"부분 매칭 후보: {partial_matches}")
                        # 첫 번째 매칭 반환
                        return partial_matches[0][1]
                    
                    raise HTTPException(status_code=404, detail=f"'{company_name}'에 해당하는 기업을 찾을 수 없습니다")
                    
        except Exception as e:
            logger.error(f"기업 코드 추출 오류: {e}")
            raise HTTPException(status_code=500, detail="기업 코드 추출 실패")
    
    async def get_financial_data(self, corp_code: str, year: str = "2023", reprt_code: str = "11014") -> List[Dict[str, Any]]:
        """재무지표 데이터 가져오기"""
        idx_cl_codes = {
            "M210000": "수익성",
            "M220000": "안정성",
            "M230000": "성장성",
            "M240000": "활동성"
        }
        
        all_data = []
        
        for code, category_name in idx_cl_codes.items():
            try:
                url = "https://opendart.fss.or.kr/api/fnlttSinglIndx.json"
                params = {
                    "crtfc_key": self.api_key,
                    "corp_code": corp_code,
                    "bsns_year": year,
                    "reprt_code": reprt_code,
                    "idx_cl_code": code
                }
                
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get("status") == "000" and data.get("list"):
                        for item in data["list"]:
                            processed_item = {
                                "idx_cl_nm": category_name,
                                "idx_nm": item.get("idx_nm", ""),
                                "idx_val": float(item.get("idx_val", 0)) if item.get("idx_val") else 0
                            }
                            all_data.append(processed_item)
                    else:
                        logger.warning(f"{category_name} 데이터 없음: {data.get('message', 'Unknown error')}")
                else:
                    logger.error(f"{category_name} API 호출 실패: {response.status_code}")
                    
            except Exception as e:
                logger.error(f"{category_name} 데이터 가져오기 오류: {e}")
        
        return all_data

# 서비스 인스턴스
financial_service = FinancialDataService()

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "Finance Dashboard API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy"}

@app.get("/financial-data")
async def get_financial_data(
    company: str = Query(..., description="기업명"),
    year: str = Query("2023", description="연도"),
    reprt_code: str = Query("11014", description="보고서 코드")
):
    """재무지표 데이터 조회"""
    try:
        logger.info(f"재무 데이터 요청: {company}, {year}, {reprt_code}")
        
        # 1. 기업 코드 다운로드
        corp_code_zip = await financial_service.download_corp_code()
        
        # 2. 기업 코드 추출
        corp_code = financial_service.extract_corp_code(corp_code_zip, company)
        
        # 3. 재무 데이터 가져오기
        financial_data = await financial_service.get_financial_data(corp_code, year, reprt_code)
        
        if not financial_data:
            return JSONResponse(
                content={"error": "재무 데이터를 찾을 수 없습니다"},
                status_code=404
            )
        
        logger.info(f"데이터 조회 완료: {len(financial_data)}개 지표")
        return financial_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"재무 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="서버 오류가 발생했습니다")

@app.get("/companies/search")
async def search_companies(query: str = Query(..., description="검색어")):
    """기업 검색"""
    try:
        corp_code_zip = await financial_service.download_corp_code()
        
        # ZIP 파일에서 기업 목록 추출
        with zipfile.ZipFile(io.BytesIO(corp_code_zip), 'r') as zip_ref:
            xml_file = None
            for file_info in zip_ref.filelist:
                if file_info.filename.endswith('CORPCODE.xml'):
                    xml_file = file_info.filename
                    break
            
            if not xml_file:
                raise HTTPException(status_code=500, detail="CORPCODE.xml 파일을 찾을 수 없습니다")
            
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
        logger.error(f"기업 검색 오류: {e}")
        raise HTTPException(status_code=500, detail="기업 검색 중 오류가 발생했습니다")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 