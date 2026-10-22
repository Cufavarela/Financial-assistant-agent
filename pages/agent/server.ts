import "dotenv/config";

import express from "express";
import { agentCardHandler, jsonRpcHandler } from "@a2a-js/sdk/server/express";

import { ladyAhorroAgentCard } from "./card";
import { requestHandler } from "./request-handler";

const app = express();

app.use(express.json());

app.use(
  "/.well-known/agent-card.json",
  agentCardHandler({
    agentCardProvider: requestHandler,
  }),
);

app.use(
  "/",
  jsonRpcHandler({
    requestHandler,
    userBuilder: async () => ({
      userId: "anonymous",
      isAuthenticated: false,
      userName: "anonymous",
    }),
  }),
);

app.listen(3001, () => {
  console.log("Lady Ahorro A2A agent listening on http://localhost:3001");
});
