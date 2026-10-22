
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";

import { superAgentCard } from "./card";
import { superAgentExecutor } from "./executor";

export const superAgentRequestHandler = new DefaultRequestHandler(
  superAgentCard,
  new InMemoryTaskStore(),
  superAgentExecutor,
);
