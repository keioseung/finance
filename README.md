# Finance Dashboard

DART API를 활용한 기업 재무지표 종합 분석 플랫폼입니다.

## 🚀 주요 기능

- **수익성 분석**: ROE, ROA, 순이익률 등 수익성 지표 분석
- **안정성 분석**: 부채비율, 유동비율 등 재무 안정성 지표 분석
- **성장성 분석**: 매출성장률, 자산성장률 등 성장 잠재력 평가
- **활동성 분석**: 자산회전율, 재고회전율 등 경영 효율성 분석
- **실시간 검색**: 기업명 자동완성 및 실시간 검색 기능
- **시각화**: 차트와 그래프를 통한 직관적인 데이터 시각화

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Recharts** - React 차트 라이브러리
- **Lucide React** - 아이콘 라이브러리
- **Framer Motion** - 애니메이션 라이브러리

### Backend
- **FastAPI** - Python 기반 고성능 웹 프레임워크
- **DART API** - 금융감독원 공시정보 API
- **XML/JSON** - 데이터 파싱 및 처리

## 📁 프로젝트 구조

```
finance/
├── app/                          # Next.js 앱 디렉토리
│   ├── components/               # React 컴포넌트
│   │   ├── CompanySearch.tsx     # 기업 검색 컴포넌트
│   │   ├── FinancialDashboard.tsx # 메인 대시보드
│   │   ├── FinancialMetrics.tsx  # 재무 지표 컴포넌트
│   │   ├── CategoryChart.tsx     # 카테고리별 차트
│   │   ├── RadarChart.tsx        # 레이더 차트
│   │   └── LoadingSpinner.tsx    # 로딩 스피너
│   ├── types/                    # TypeScript 타입 정의
│   │   └── financial.ts          # 재무 데이터 타입
│   ├── utils/                    # 유틸리티 함수
│   │   └── financial.ts          # 재무 데이터 처리 함수
│   ├── services/                 # API 서비스
│   │   └── api.ts                # API 클라이언트
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── backend/                      # FastAPI 백엔드
│   ├── main.py                   # 메인 애플리케이션
│   └── requirements.txt          # Python 의존성
├── package.json                  # Node.js 의존성
├── tailwind.config.js            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── README.md                     # 프로젝트 문서
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/keioseung/finance.git
cd finance
```

### 2. Frontend 의존성 설치
```bash
npm install
```

### 3. Backend 의존성 설치
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. 개발 서버 실행

#### Backend 서버 (터미널 1)
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend 서버 (터미널 2)
```bash
npm run dev
```

### 6. 브라우저에서 확인
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API 문서: http://localhost:8000/docs

## 📊 사용 방법

1. **기업 검색**: 메인 페이지에서 분석하고 싶은 기업명을 입력합니다.
2. **자동완성**: 입력 중 자동완성 기능을 통해 정확한 기업명을 선택할 수 있습니다.
3. **재무지표 확인**: 검색 결과로 해당 기업의 종합 재무지표를 확인합니다.
4. **차트 분석**: 다양한 차트와 그래프를 통해 직관적으로 데이터를 분석합니다.

## 🔧 개발 가이드

### 새로운 컴포넌트 추가
```bash
# app/components/ 디렉토리에 새 컴포넌트 생성
touch app/components/NewComponent.tsx
```

### API 엔드포인트 추가
```python
# backend/main.py에 새 엔드포인트 추가
@app.get("/new-endpoint")
async def new_endpoint():
    return {"message": "새 엔드포인트"}
```

### 스타일 수정
- `app/globals.css`에서 전역 스타일 수정
- `tailwind.config.js`에서 Tailwind 설정 커스터마이징

## 🧪 테스트

```bash
# Frontend 테스트
npm run test

# Backend 테스트
cd backend
python -m pytest
```

## 📦 배포

### Vercel 배포 (Frontend)
```bash
npm run build
vercel --prod
```

### Railway 배포 (Backend)
```bash
# railway.json 설정 후 자동 배포
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

- [DART API](https://opendart.fss.or.kr/) - 금융감독원 공시정보 제공
- [Next.js](https://nextjs.org/) - React 프레임워크
- [FastAPI](https://fastapi.tiangolo.com/) - Python 웹 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크 