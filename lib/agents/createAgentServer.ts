import express from "express";
import type { A2ARequestHandler } from "@a2a-js/sdk/server";
import { agentCardHandler, jsonRpcHandler } from "@a2a-js/sdk/server/express";

import { getListenPort } from "./config";

type CreateAgentServerOptions = {
  requestHandler: A2ARequestHandler;
  url: string;
  name: string;
};

export const createAgentServer = ({
  requestHandler,
  url,
  name,
}: CreateAgentServerOptions) => {
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

  const port = getListenPort(url);

  app.listen(port, () => {
    console.log(`${name} listening on ${url}`);
  });

  return app;
};
