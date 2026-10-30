import type { AgentCard } from "@a2a-js/sdk";

import { agentUrls } from "../../lib/agents/config";

export const feminanzasAgentCard: AgentCard = {
  name: "Feminanzas Specialist",
  description:
    "Specialist agent that answers questions about Feminanzas and its personal finance content.",
  version: "1.0.0",

  supportedInterfaces: [
    {
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
      url: agentUrls.femi,
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
      id: "feminanzas-finance",
      name: "Feminanzas Finance",
      description:
        "Answers questions using Feminanzas' personal finance content.",
      tags: ["personal-finance", "saving", "investing", "entrepreneurship"],
      examples: [
        "¿Qué es Feminanzas?",
        "¿Qué cursos ofrece Feminanzas?",
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
