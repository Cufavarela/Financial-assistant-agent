
import "dotenv/config";

import express from "express";
import { agentCardHandler, jsonRpcHandler } from "@a2a-js/sdk/server/express";
import { superAgentRequestHandler } from "./request-handler";

const app = express();

app.use(express.json());

app.use(
  "/.well-known/agent-card.json",
  agentCardHandler({
    agentCardProvider: superAgentRequestHandler,
  }),
);

app.use(
  "/",
  jsonRpcHandler({
    requestHandler: superAgentRequestHandler,
    userBuilder: async () => ({
      userId: "anonymous",
      isAuthenticated: false,
      userName: "anonymous",
    }),
  }),
);

app.listen(3002, () => {
  console.log("Super agent listening on http://localhost:3002");
});
