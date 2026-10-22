import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";

import { feminanzasAgentCard } from "./card";
import { feminanzasAgentExecutor } from "./executor";

export const requestHandler = new DefaultRequestHandler(
  feminanzasAgentCard,
  new InMemoryTaskStore(),
  feminanzasAgentExecutor,
);
