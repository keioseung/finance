# Finance Dashboard - 재무지표 분석 플랫폼

DART API를 활용한 기업 재무지표 종합 분석 대시보드입니다. 블랙락 스타일의 고급스러운 UI로 재무 데이터를 시각화합니다.

## 🚀 주요 기능

- **수익성 분석**: ROE, ROA 등 수익성 지표 분석
- **안정성 분석**: 부채비율, 유동비율 등 재무 안정성 지표
- **성장성 분석**: 매출성장률, 자산성장률 등 성장 잠재력 평가
- **활동성 분석**: 자산회전율, 재고회전율 등 경영 효율성 분석
- **종합 평가**: 레이더 차트를 통한 4개 영역 종합 평가

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Recharts** - 데이터 시각화
- **Lucide React** - 아이콘
- **Framer Motion** - 애니메이션

### Backend
- **FastAPI** - Python 웹 프레임워크
- **DART API** - 금융감독원 공시정보
- **Uvicorn** - ASGI 서버

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
# Frontend 의존성 설치
npm install

# Backend 의존성 설치
cd backend
pip install -r requirements.txt
```

### 2. 환경 변수 설정

```bash
# .env.local 파일 생성
DART_API_KEY=your_dart_api_key_here
```

### 3. 개발 서버 실행

```bash
# Frontend 개발 서버 (포트 3000)
npm run dev

# Backend 개발 서버 (포트 8000)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🚀 Railway 배포

### 1. Railway CLI 설치

```bash
npm install -g @railway/cli
```

### 2. Railway 로그인 및 배포

```bash
# Railway 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

### 3. 환경 변수 설정 (Railway)

Railway 대시보드에서 다음 환경 변수를 설정하세요:

```
DART_API_KEY=your_dart_api_key_here
```

## 📊 API 엔드포인트

### Frontend API Routes
- `GET /api/financial-data?company={company_name}` - 재무 데이터 조회

### Backend API Endpoints
- `GET /` - 루트 엔드포인트
- `GET /health` - 헬스 체크
- `GET /financial-data?company={company_name}&year={year}&reprt_code={reprt_code}` - 재무 데이터 조회
- `GET /companies/search?query={search_term}` - 기업 검색

## 🎨 UI/UX 특징

- **다크 테마**: 블랙락 스타일의 고급스러운 다크 테마
- **글래스모피즘**: 반투명 효과와 블러 처리
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **인터랙티브 차트**: Recharts를 활용한 동적 시각화
- **스무스 애니메이션**: Framer Motion을 통한 부드러운 전환 효과

## 📈 데이터 시각화

### 1. 종합 대시보드
- 4개 카테고리별 주요 지표 카드
- 실시간 점수 계산 및 등급 평가

### 2. 카테고리별 상세 분석
- 막대 차트를 통한 지표별 비교
- 해석 기준에 따른 색상 코딩
- 상위 지표 하이라이트

### 3. 레이더 차트
- 4개 영역의 종합적인 재무 상태 시각화
- 0-100점 스케일로 정규화된 점수
- 종합 등급 평가 (A+, A, B, C, D)

## 🔧 개발 가이드

### 컴포넌트 구조

```
app/
├── components/
│   ├── CompanySearch.tsx      # 기업 검색
│   ├── FinancialDashboard.tsx # 메인 대시보드
│   ├── CategoryChart.tsx      # 카테고리별 차트
│   ├── RadarChart.tsx         # 레이더 차트
│   ├── FinancialMetrics.tsx   # 재무 지표 상세
│   └── LoadingSpinner.tsx     # 로딩 스피너
├── api/
│   └── financial-data/
│       └── route.ts           # API 라우트
└── globals.css                # 글로벌 스타일
```

### 스타일링 가이드

- **색상 팔레트**: HSL 변수를 활용한 다크 테마
- **글래스 효과**: `glass` 클래스로 반투명 배경
- **그라데이션**: `gradient-bg` 클래스로 배경 그라데이션
- **반응형**: Tailwind CSS 브레이크포인트 활용

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요. 