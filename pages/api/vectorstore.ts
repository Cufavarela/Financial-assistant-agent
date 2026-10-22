import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { run as createVectorStore } from "../../ingest";
import { run as createFemiVectorStore } from "../../ingest-femi";

let vectorStorePromise: Promise<MemoryVectorStore> | undefined;
let femiVectorStorePromise: Promise<MemoryVectorStore> | undefined;

export const getVectorStore = (): Promise<MemoryVectorStore> => {
  if (!vectorStorePromise) {
    vectorStorePromise = createVectorStore();
  }

  return vectorStorePromise;
};

export const getFemiVectorStore = (): Promise<MemoryVectorStore> => {
  if (!femiVectorStorePromise) {
    femiVectorStorePromise = createFemiVectorStore();
  }

  return femiVectorStorePromise;
};
