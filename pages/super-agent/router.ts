import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const routingSchema = z.object({
  route: z.enum(["lady", "femi", "both"]),
});

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const router = model.withStructuredOutput(routingSchema);

export const decideRoute = async (question: string) => {
  return router.invoke([
    {
      role: "system",
      content: `
You are a routing assistant responsible for choosing which financial
education specialist should answer a user's question.

Available specialists:

- lady: Lady Ahorro, focused on personal finance, saving, budgeting
  and intelligent investing.
- femi: Feminanzas, focused on women's financial education,
  financial independence and related topics.
- both: Use when the user explicitly asks to compare, contrast,
  or combine the perspectives of both specialists.

Rules:
- Choose the specialist whose expertise best matches the question.
- Do not choose both simply because a question could be answered
  by either specialist.
- If the question explicitly mentions a specialist or their website,
  choose that specialist unless both are explicitly requested.
- Return only the structured routing decision.
      `,
    },
    {
      role: "user",
      content: question,
    },
  ]);
};
