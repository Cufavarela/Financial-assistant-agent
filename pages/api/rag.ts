import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const QA_PROMPT = PromptTemplate.fromTemplate(`
You are an AI assistant for Lady Ahorro (https://ladyahorro.com), a site about personal finance, saving, and intelligent investing.

You are given extracted parts of the website and a question. Answer based only on the provided context.

When you cite a source, only use exact https:// URLs that appear in the context.
Do NOT invent or guess URL paths.

If you don't know the answer from the context, say "Hmm, I'm not sure."
Don't make anything up.

If the question is not about Lady Ahorro, its courses, services, or personal finance content from the site, politely say you are tuned to only answer questions about Lady Ahorro.

Prefer answering in the same language the user used.

Question:
{question}

=========
Context:
{context}
=========

Answer in Markdown:
`);

export const makeRag = async (
  vectorstore: MemoryVectorStore,
  onTokenStream?: (token: string) => void,
) => {
  const retriever = vectorstore.asRetriever();

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  return async (question: string): Promise<string> => {
    const documents = await retriever.invoke(question);

    const context = documents
      .map((document) => document.pageContent)
      .join("\n\n");

    const prompt = await QA_PROMPT.format({
      question,
      context,
    });

    if (!onTokenStream) {
      const response = await model.invoke(prompt);

      if (typeof response.content !== "string") {
        throw new Error("Expected a text response from the model");
      }

      return response.content;
    }

    let answer = "";

    const stream = await model.stream(prompt);

    for await (const chunk of stream) {
      const token = chunk.content;

      if (typeof token !== "string") {
        continue;
      }

      answer += token;
      onTokenStream(token);
    }

    return answer;
  };
};
