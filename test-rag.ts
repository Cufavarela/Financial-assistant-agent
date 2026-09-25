import "dotenv/config";

import { makeRag } from "./pages/api/rag";
import { getVectorStore } from "./pages/api/vectorstore";

const main = async () => {
  console.log("Getting vector store...");

  const vectorStore = await getVectorStore();

  console.log("Creating streaming RAG...");

  const rag = await makeRag(vectorStore, (token) => {
    process.stdout.write(token);
  });

  console.log("\n\n");

  await rag("¿Qué es Lady Ahorro y qué tipo de contenido ofrece?");
};

main();