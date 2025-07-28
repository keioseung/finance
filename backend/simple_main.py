from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://finance-jaxj.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Finance Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "port": os.getenv("PORT", "8000")}

@app.get("/financial-data")
async def get_financial_data(company: str, year: str = "2023"):
    # 임시 데이터 반환
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
        }
    ]

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting simple backend on {host}:{port}")
    uvicorn.run(app, host=host, port=port) 