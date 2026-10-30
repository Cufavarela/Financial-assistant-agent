import "dotenv/config";

import { agentUrls } from "../../lib/agents/config";
import { createAgentServer } from "../../lib/agents/createAgentServer";
import { requestHandler } from "./request-handler";

createAgentServer({
  requestHandler,
  url: agentUrls.lady,
  name: "Lady Ahorro A2A agent",
});
