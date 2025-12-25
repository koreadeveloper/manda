# 🎯 Manda-AI | AI 기반 만다라트 목표 설정 도구

<div align="center">

![Manda-AI Banner](https://img.shields.io/badge/Manda--AI-Goal%20Master-06B6D4?style=for-the-badge&logo=target&logoColor=white)

**AI가 당신의 꿈을 64개의 구체적인 실행 계획으로 변환합니다**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/koreadeveloper/manda)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://manda.vercel.app) · [📖 Documentation](#사용-방법) · [🐛 Report Bug](https://github.com/koreadeveloper/manda/issues)

</div>

---

## ✨ 주요 기능

### 🤖 AI 자동 생성
- **Groq AI (Llama 3.3)** 기반의 초고속 만다라트 생성
- 최종 목표 입력만으로 **8개 하위 목표 + 64개 실행 계획** 자동 완성
- 한국어 최적화 프롬프트로 자연스러운 결과물

### 📊 스마트 만다라트 그리드
- **9×9 인터랙티브 그리드** - 클릭으로 바로 편집
- **실시간 동기화** - 중앙 그리드와 주변 그리드 자동 연동
- **진행률 추적** - 완료한 목표 시각적 표시

### 🎨 아름다운 디자인
- **다크/라이트 모드** 지원
- **5가지 테마 컬러** (Cyan, Rose, Amber, Emerald, Indigo)
- **Do Hyeon 폰트** - 목표가 더욱 돋보이는 디자인
- **동적 폰트 스케일링** - 텍스트 길이에 따라 자동 조절

### 💾 저장 & 공유
- **로컬 저장** - 브라우저에 자동 저장 (Zustand Persist)
- **PNG 다운로드** - 고해상도 이미지로 저장
- **URL 공유** - 링크 하나로 만다라트 공유

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS, Lucide Icons |
| **State** | Zustand (with Persist) |
| **AI** | Groq API (Llama 3.3 70B) |
| **Export** | html2canvas |

---

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn
- [Groq API Key](https://console.groq.com/)

### 설치

```bash
# 1. 레포지토리 클론
git clone https://github.com/koreadeveloper/manda.git
cd manda

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열고 GROQ_API_KEY 입력

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수

`.env.local` 파일 생성:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

---

## 📖 사용 방법

### 1️⃣ AI 자동 생성
1. **"AI 자동 생성"** 버튼 클릭
2. 최종 목표 입력 (예: "2025년 마라톤 완주")
3. AI가 5~10초 내에 전체 만다라트 완성

### 2️⃣ 수동 편집
- 각 셀을 클릭하여 직접 텍스트 입력/수정
- 중앙 그리드 수정 시 주변 그리드 자동 동기화

### 3️⃣ 진행률 관리
- 셀 클릭 시 완료 체크 (✓)
- 상단에서 전체 진행률 확인

### 4️⃣ 저장 & 공유
- 📥 **다운로드**: PNG 이미지로 저장
- 🔗 **공유**: URL 복사하여 다른 사람과 공유

---

## 🌐 Vercel 배포 가이드

### 방법 1: Vercel Dashboard (권장)

1. [Vercel](https://vercel.com)에 로그인
2. **"New Project"** 클릭
3. GitHub 레포지토리 연결
4. **Environment Variables** 설정:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_your_api_key`
5. **Deploy** 클릭

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add GROQ_API_KEY
```

---

## 📁 프로젝트 구조

```
manda/
├── components/
│   ├── AIModal.tsx      # AI 생성 모달
│   ├── MandaCell.tsx    # 개별 셀 컴포넌트
│   └── SubGrid.tsx      # 3×3 서브그리드
├── App.tsx              # 메인 앱 컴포넌트
├── store.ts             # Zustand 상태 관리
├── groqService.ts       # Groq AI API 연동
├── types.ts             # TypeScript 타입 정의
├── index.html           # HTML 엔트리
├── index.css            # 글로벌 스타일
└── vite.config.ts       # Vite 설정
```

---

## 🎯 만다라트란?

**만다라트(Mandal-Art)**는 일본의 디자이너 이마이즈미 히로아키가 개발한 목표 설정 기법입니다.

- 중심에 **최종 목표**를 배치
- 주변 8칸에 **하위 목표** 작성
- 각 하위 목표를 다시 8개의 **실행 계획**으로 세분화
- 총 **64개의 구체적 액션 아이템** 도출

야구 선수 **오타니 쇼헤이**가 고교 시절 이 기법으로 "8구단 드래프트 1순위"를 달성한 것으로 유명합니다.

---

## 🔒 보안 안내

- `.env.local` 파일은 `.gitignore`에 포함되어 **GitHub에 업로드되지 않습니다**
- API 키는 Vercel의 환경 변수로 안전하게 관리됩니다
- 클라이언트 사이드에서는 빌드 시점에 주입된 키만 사용됩니다

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

---

## 💬 문의

문제가 있거나 제안사항이 있으시면 [Issues](https://github.com/koreadeveloper/manda/issues)에 등록해주세요!

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요! ⭐**

Made with ❤️ by koreadeveloper

</div>
