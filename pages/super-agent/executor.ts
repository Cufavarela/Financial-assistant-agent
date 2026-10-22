import { Role, TaskState } from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";
import {
  AgentEvent,
  type AgentExecutor,
  type ExecutionEventBus,
  type RequestContext,
} from "@a2a-js/sdk/server";

export const superAgentExecutor: AgentExecutor = {
  execute: async (
    requestContext: RequestContext,
    eventBus: ExecutionEventBus,
  ): Promise<void> => {
    const { taskId, contextId, userMessage } = requestContext;

    const question = userMessage.parts
      .filter((part) => part.content?.$case === "text")
      .map((part) => part?.content?.value)
      .join("\n");

    eventBus.publish(
      AgentEvent.task({
        id: taskId,
        contextId,
        status: {
          state: TaskState.TASK_STATE_WORKING,
          message: undefined,
          timestamp: new Date().toISOString(),
        },
        artifacts: [],
        history: [userMessage],
        metadata: undefined,
      }),
    );

    try {
      const factory = new ClientFactory();
      const client = await factory.createFromUrl("http://localhost:3001");

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

      if ("status" in result && result?.status?.state === 4) {
        const errorMessage = result?.status?.message?.parts
          .map((part) => {
            if (part?.content?.$case === "text") {
              return part?.content?.value;
            }

            return "";
          })
          .filter(Boolean)
          .join("\n");

        throw new Error(errorMessage || "Lady Ahorro specialist task failed.");
      }

      const answer =
        "artifacts" in result
          ? (result.artifacts ?? [])
              .flatMap((artifact) => artifact.parts)
              .filter((part) => part.content?.$case === "text")
              .map((part) => part?.content?.value)
              .join("\n")
          : "";

      if (!answer) {
        throw new Error("Lady Ahorro returned no text artifact.");
      }

      eventBus.publish(
        AgentEvent.artifactUpdate({
          taskId,
          contextId,
          artifact: {
            artifactId: `${taskId}-answer`,
            name: "Super agent answer",
            description: "Answer received from the Lady Ahorro specialist.",
            parts: [
              {
                content: {
                  $case: "text",
                  value: answer,
                },
                metadata: undefined,
                filename: "",
                mediaType: "text/plain",
              },
            ],
            metadata: undefined,
            extensions: [],
          },
          append: false,
          lastChunk: true,
          metadata: undefined,
        }),
      );

      eventBus.publish(
        AgentEvent.statusUpdate({
          taskId,
          contextId,
          status: {
            state: TaskState.TASK_STATE_COMPLETED,
            message: undefined,
            timestamp: new Date().toISOString(),
          },
          metadata: undefined,
        }),
      );
    } catch (error) {
      console.error("Super agent delegation failed:", error);

      eventBus.publish(
        AgentEvent.statusUpdate({
          taskId,
          contextId,
          status: {
            state: TaskState.TASK_STATE_FAILED,
            message: undefined,
            timestamp: new Date().toISOString(),
          },
          metadata: undefined,
        }),
      );
    }
  },

  cancelTask: async (
    taskId: string,
    _eventBus: ExecutionEventBus,
  ): Promise<void> => {
    console.log("Cancellation requested:", taskId);
  },
};
