import OpenAI from "openai";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1),
  birthDate: z.string().min(8),
  mbti: z.string().optional(),
});

const responseSchema = z.object({
  summary: z.string(),
  love: z.string(),
  money: z.string(),
  workStudy: z.string(),
  luckyItem: z.string(),
  avoid: z.string(),
  closingJoke: z.string(),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "OPENAI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const { name, birthDate, mbti } = parsed.data;

    const prompt = `
너는 한국어 운세 카피라이터다.
톤: 밈/드립형, 하지만 과하지 않고 안전한 수준(약한 드립)만 사용.

입력 정보:
- 이름: ${name}
- 생년월일: ${birthDate}
- MBTI: ${mbti || "미입력"}

다음 규칙으로 오늘의 운세를 생성해.
- 각 항목은 1~2문장
- 과도한 욕설/비하 금지
- 사행성 조장 금지
- 현실적으로 가벼운 조언 포함

아래 JSON 스키마로만 응답해:
{
  "summary": "",
  "love": "",
  "money": "",
  "workStudy": "",
  "luckyItem": "",
  "avoid": "",
  "closingJoke": ""
}
`;

    const completion = await openai.responses.create({
      model: "gpt-5.3-codex",
      input: prompt,
      reasoning: { effort: "medium" },
      text: {
        format: {
          type: "json_schema",
          name: "fortune",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              love: { type: "string" },
              money: { type: "string" },
              workStudy: { type: "string" },
              luckyItem: { type: "string" },
              avoid: { type: "string" },
              closingJoke: { type: "string" },
            },
            required: ["summary", "love", "money", "workStudy", "luckyItem", "avoid", "closingJoke"],
          },
        },
      },
    });

    const raw = completion.output_text;
    const json = JSON.parse(raw);
    const valid = responseSchema.safeParse(json);

    if (!valid.success) {
      return Response.json({ error: "응답 형식 검증에 실패했습니다." }, { status: 502 });
    }

    return Response.json({ fortune: valid.data });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "서버 오류" }, { status: 500 });
  }
}
