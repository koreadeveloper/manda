
import { AIResponse } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Custom error for rate limiting
export class RateLimitError extends Error {
    constructor() {
        super("서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
        this.name = "RateLimitError";
    }
}

export const generateMandalart = async (mainGoal: string): Promise<AIResponse> => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY가 설정되지 않았습니다. .env.local 파일에 GROQ_API_KEY를 설정해주세요.");
    }

    const systemPrompt = `당신은 세계 최고의 목표 달성 코치입니다. 사용자의 목표를 분석하여 가장 실질적이고 구체적인 만다라트 계획을 제안합니다.

[언어 규칙 - 최우선 준수사항]
- 오직 한국어(Korean)와 영어(English)만 사용하세요.
- 절대 금지: 한자(中文/漢字), 일본어(日本語), 러시아어(Русский), 기타 모든 외국어
- 모든 텍스트는 한글 또는 영어 알파벳으로만 작성하세요.
- 예: "운동하기" (O), "運動" (X), "うんどう" (X)

[만다라트 구조 규칙]
1. 정확히 8개의 하위 목표(subGoals)를 생성합니다.
2. 각 하위 목표마다 정확히 8개의 세부 실행 과제(tasks)를 생성합니다.
3. 총 64개의 tasks가 있어야 합니다 (8개 subGoals × 8개 tasks).

[텍스트 길이 및 상세도]
- 모든 텍스트: 공백 포함 8~15자
- 하위 목표(title): 핵심 카테고리를 명확히 (예: "체력 관리", "시간 관리", "재정 계획")
- 실행 과제(tasks): 구체적이고 실행 가능한 행동으로 작성
  * 나쁜 예시: "운동", "공부", "절약"
  * 좋은 예시: "아침 30분 조깅", "영어 단어 50개", "커피 줄이기"
- 명사형 또는 짧은 동사형으로 마무리

[작성 스타일]
- 실천 가능하고 측정 가능한 행동 중심
- 일상에서 바로 적용할 수 있는 구체적인 계획
- 동기 부여가 되는 긍정적인 표현 사용

반드시 아래 JSON 형식으로만 응답하세요. 다른 설명이나 텍스트 없이 순수 JSON만 출력:
{
  "mainGoal": "사용자 목표",
  "subGoals": [
    {
      "title": "하위 목표 1",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    },
    {
      "title": "하위 목표 2",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    },
    {
      "title": "하위 목표 3",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    },
    {
      "title": "하위 목표 4",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    },
    {
      "title": "하위 목표 5",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    },
    {
      "title": "하위 목표 6",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    },
    {
      "title": "하위 목표 7",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    },
    {
      "title": "하위 목표 8",
      "tasks": ["과제1", "과제2", "과제3", "과제4", "과제5", "과제6", "과제7", "과제8"]
    }
  ]
}`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: `다음 최종 목표에 대한 만다라트 계획표를 작성해줘: "${mainGoal}"\n\n반드시 한국어로, 한자 없이, 구체적인 실행 계획으로 작성해줘.`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Groq API Error:", response.status, errorData);

            if (response.status === 429) {
                throw new RateLimitError();
            }
            if (response.status === 400) {
                throw new Error("서버 모델 업데이트 중입니다. 잠시 후 다시 시도해 주세요.");
            }
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error("Empty response from Groq:", data);
            throw new Error("AI 응답이 비어있습니다. 다시 시도해주세요.");
        }

        const parsed = JSON.parse(content) as AIResponse;

        // Filter function to remove non-Korean/English characters
        const filterText = (text: string): string => {
            // Remove Japanese (Hiragana, Katakana), Chinese characters, Russian, etc.
            // Allow only: Korean (Hangul), English, numbers, spaces, basic punctuation
            return text.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s.,!?'"()\-~·%@#&*+=:;/\\]/g, '').trim();
        };

        // Apply filter to all text fields
        parsed.mainGoal = filterText(parsed.mainGoal);
        for (const sg of parsed.subGoals) {
            sg.title = filterText(sg.title);
            sg.tasks = sg.tasks.map(task => filterText(task));
        }

        // Validate response structure
        if (!parsed.mainGoal || !parsed.subGoals || parsed.subGoals.length !== 8) {
            console.error("Invalid response structure:", parsed);
            throw new Error("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
        }

        // Validate each subGoal has 8 tasks
        for (const sg of parsed.subGoals) {
            if (!sg.title || !sg.tasks || sg.tasks.length !== 8) {
                console.error("Invalid subGoal structure:", sg);
                throw new Error("하위 목표 형식이 올바르지 않습니다. 다시 시도해주세요.");
            }
        }

        return parsed;
    } catch (error: any) {
        console.error("generateMandalart error:", error);

        // Handle rate limit errors
        if (error instanceof RateLimitError) {
            throw error;
        }

        if (error?.message?.includes('429') || error?.message?.includes('rate')) {
            throw new RateLimitError();
        }

        // Re-throw other errors with user-friendly message
        if (error instanceof SyntaxError) {
            throw new Error("AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.");
        }

        throw error;
    }
};
