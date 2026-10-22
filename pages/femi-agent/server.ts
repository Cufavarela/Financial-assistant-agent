import "dotenv/config";

import express from "express";
import { agentCardHandler, jsonRpcHandler } from "@a2a-js/sdk/server/express";
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

app.listen(3003, () => {
  console.log("Feminanzas A2A agent listening on http://localhost:3003");
});
