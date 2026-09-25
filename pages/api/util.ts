import { OpenAI } from "langchain/llms";
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores";
import { PromptTemplate } from "langchain/prompts";

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
  `You are an AI assistant for Lady Ahorro (https://ladyahorro.com), a site about personal finance, saving, and intelligent investing.
You are given the following extracted parts of the website and a question. Provide a conversational answer based only on that context.
When you cite a source, only use exact https:// URLs that appear in the context (including the Links section). Do NOT invent or guess URL paths (for example, never turn "Cursos" into https://ladyahorro.com/cursos unless that exact URL is in the context).
If you know a page name but the full URL is not in the context, link to https://ladyahorro.com or say you do not have the exact link.
If you don't know the answer from the context, say "Hmm, I'm not sure." Don't make anything up.
If the question is not about Lady Ahorro, its courses, services, or personal finance content from the site, politely say you are tuned to only answer questions about Lady Ahorro.
Prefer answering in the same language the user used (Spanish or English).
Question: {question}
=========
{context}
=========
Answer in Markdown:`);

export const makeChain = (
  vectorstore: HNSWLib,
  onTokenStream?: (token: string) => void
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
    }),
    prompt: CONDENSE_PROMPT,
  });

  const docChain = loadQAChain(
    new OpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      streaming: Boolean(onTokenStream),
      callbackManager: {
        handleNewToken: onTokenStream,
      },
    }),
    { prompt: QA_PROMPT },
  );

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
  });
};
