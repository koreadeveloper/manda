
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "./types";

// Custom error for quota exceeded
export class QuotaExceededError extends Error {
  constructor() {
    super("사용량이 많아 잠시 후 다시 시도해주세요.");
    this.name = "QuotaExceededError";
  }
}

export const generateMandalart = async (mainGoal: string): Promise<AIResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY를 설정해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: `너는 세계 최고의 전략 기획자이자 동기부여 전문가야. 
      사용자의 최종 목표 "${mainGoal}"을 달성하기 위한 완벽한 만다라트 계획표를 작성해줘.
      
      [작성 가이드라인 - 필독]
      1. 8개의 하위 목표(subGoals)와 각각 8개씩, 총 64개의 실행 계획(tasks)을 작성할 것.
      2. **가장 중요**: 각 항목의 길이는 **공백 포함 10~15자**로 아주 간결하게 작성해.
         - 예시: "매일 5km 러닝", "주 3회 헬스장", "영단어 50개 암기"
         - 절대로 15자를 넘기지 마. 긴 문장은 UI가 무너짐.
      3. 명사형 또는 짧은 동사형으로 끝맺음 (예: "아침 스트레칭", "독서 30분").
      4. 실천 가능하고 구체적인 행동 중심으로 작성할 것.
      5. 각 하위 목표(subGoals)의 title도 15자 이내로 간결하게.
      
      반드시 제공된 JSON 스키마를 엄격히 준수하여 응답해.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainGoal: {
              type: Type.STRING,
              description: "사용자가 입력한 최종 목표 (15자 이내)"
            },
            subGoals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "하위 목표 제목 (15자 이내)"
                  },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                      description: "구체적 실행 계획 (10~15자)"
                    }
                  }
                },
                required: ["title", "tasks"]
              }
            }
          },
          required: ["mainGoal", "subGoals"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}") as AIResponse;

    // Validate response structure
    if (!parsed.mainGoal || !parsed.subGoals || parsed.subGoals.length !== 8) {
      throw new Error("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
    }

    return parsed;
  } catch (error: any) {
    // Handle quota exceeded (429) error
    if (error?.status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new QuotaExceededError();
    }

    // Re-throw other errors
    throw error;
  }
};
