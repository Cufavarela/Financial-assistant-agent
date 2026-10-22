
import type { AgentCard } from "@a2a-js/sdk";

export const superAgentCard: AgentCard = {
  name: "Super Agent",
  description:
    "Coordinates requests and delegates questions to specialist agents.",
  version: "1.0.0",

  supportedInterfaces: [
    {
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
      url: "http://localhost:3002",
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
      id: "specialist-delegation",
      name: "Specialist Delegation",
      description:
        "Routes questions to appropriate specialist agents and returns their answers.",
      tags: ["delegation", "coordination"],
      examples: [
        "¿Qué es Lady Ahorro?",
        "¿Qué contenido ofrece Lady Ahorro?",
      ],
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
