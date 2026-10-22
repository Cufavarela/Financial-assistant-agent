import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";

import { ladyAhorroAgentCard } from "./card";
import { ladyAhorroAgentExecutor } from "./executor";

export const requestHandler = new DefaultRequestHandler(
  ladyAhorroAgentCard,
  new InMemoryTaskStore(),
  ladyAhorroAgentExecutor,
);