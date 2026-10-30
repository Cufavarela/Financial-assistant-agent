import { Role, type Part, type SendMessageRequest } from "@a2a-js/sdk";

export const extractTextFromParts = (parts: Part[]): string =>
  parts
    .filter((part) => part.content?.$case === "text")
    .map((part) => (part.content?.$case === "text" ? part.content.value : ""))
    .filter(Boolean)
    .join("\n");

export const buildUserSendMessageRequest = (
  question: string,
): SendMessageRequest => ({
  message: {
    messageId: crypto.randomUUID(),
    contextId: crypto.randomUUID(),
    taskId: "",
    role: Role.ROLE_USER,
    parts: [
      {
        content: {
          $case: "text",
          value: question,
        },
        metadata: undefined,
        filename: "",
        mediaType: "text/plain",
      },
    ],
    metadata: undefined,
    extensions: [],
    referenceTaskIds: [],
  },
  tenant: "",
  configuration: undefined,
  metadata: undefined,
});
