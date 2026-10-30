import type { NextApiRequest, NextApiResponse } from "next";
import { ClientFactory } from "@a2a-js/sdk/client";
import { Role, TaskState } from "@a2a-js/sdk";
import { agentUrls } from "../../lib/agents/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { question } = req.body;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  sendData(JSON.stringify({ data: "" }));

  try {
    const factory = new ClientFactory();
    const client = await factory.createFromUrl(agentUrls.super);

    const result = await client.sendMessage({
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

    if (
      "status" in result &&
      result.status?.state === TaskState.TASK_STATE_FAILED
    ) {
      const errorMessage = result.status.message?.parts
        ?.flatMap((part) =>
          part.content?.$case === "text" ? [part.content.value] : [],
        )
        .join("\n");

      throw new Error(errorMessage || "Super Agent task failed.");
    }

    const answer =
      "artifacts" in result
        ? (result.artifacts ?? [])
            .flatMap((artifact) => artifact.parts)
            .filter((part) => part.content?.$case === "text")
            .map((part) => part.content?.value)
            .join("\n")
        : "";

    if (!answer) {
      throw new Error("Super Agent returned no text artifact.");
    }

    sendData(JSON.stringify({ data: answer }));
  } catch (err) {
    console.error("[Chat API] Super Agent request failed:", err);

    sendData(
      JSON.stringify({
        data: "Sorry, something went wrong. Please try again.",
      }),
    );
  } finally {
    sendData("[DONE]");
    res.end();
  }
}
