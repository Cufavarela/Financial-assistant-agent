import { ChatOpenAI } from "@langchain/openai";

type SpecialistAnswer = {
  name: string;
  answer: string;
};

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

export const synthesizeAnswers = async (
  question: string,
  answers: SpecialistAnswer[],
): Promise<string> => {
  const specialistsContext = answers
    .map(
      ({ name, answer }) => `
Specialist: ${name}
Answer:
${answer}
`,
    )
    .join("\n---\n");

  const response = await model.invoke([
    {
      role: "system",
      content: `
You are the Super Agent responsible for synthesizing answers
from financial education specialists.

Your task is to produce one coherent answer to the user's question.

Rules:
- Use only information provided in the specialists' answers.
- Compare their perspectives when relevant.
- Highlight meaningful agreements and differences.
- Preserve useful details and source URLs exactly as provided.
- Never invent facts, recommendations, or source URLs.
- If a specialist doesn't provide enough information, acknowledge it.
- Avoid repeating the same information.
- Write naturally and structure the response clearly.
- Respond in the same language as the user's question.
      `,
    },
    {
      role: "user",
      content: `
Original question:
${question}

Specialists' answers:
${specialistsContext}
      `,
    },
  ]);

  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
};
