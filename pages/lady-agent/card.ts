import type { AgentCard } from "@a2a-js/sdk";

export const ladyAhorroAgentCard: AgentCard = {
  name: "Lady Ahorro Specialist",
  description:
    "Specialist agent that answers questions about Lady Ahorro and its personal finance content.",
  version: "1.0.0",

  supportedInterfaces: [
    {
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
      url: "http://localhost:3001",
      tenant: "",
    },
  ],

  capabilities: {
    streaming: false,
    pushNotifications: false,
    extensions: [],
  },

  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],

  skills: [
    {
      id: "lady-ahorro-finance",
      name: "Lady Ahorro Finance",
      description:
        "Answers questions using Lady Ahorro's personal finance content.",
      tags: ["personal-finance", "saving", "investing"],
      examples: ["¿Qué es Lady Ahorro?", "¿Qué contenido ofrece Lady Ahorro?"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
      securityRequirements: [],
    },
  ],

  provider: undefined,
  documentationUrl: undefined,
  securitySchemes: {},
  securityRequirements: [],
  signatures: [],
  iconUrl: undefined,
};
