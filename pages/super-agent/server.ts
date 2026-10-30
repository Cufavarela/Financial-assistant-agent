import "dotenv/config";

import { agentUrls } from "../../lib/agents/config";
import { createAgentServer } from "../../lib/agents/createAgentServer";
import { superAgentRequestHandler } from "./request-handler";

createAgentServer({
  requestHandler: superAgentRequestHandler,
  url: agentUrls.super,
  name: "Super agent",
});
