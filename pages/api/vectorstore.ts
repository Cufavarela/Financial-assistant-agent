import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { run as createVectorStore } from "../../ingest";

let vectorStorePromise: Promise<MemoryVectorStore> | undefined;

export const getVectorStore = (): Promise<MemoryVectorStore> => {
  if (!vectorStorePromise) {
    vectorStorePromise = createVectorStore();
  }

  return vectorStorePromise;
};