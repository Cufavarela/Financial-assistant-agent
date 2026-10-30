import { TaskState } from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";
import {
  AgentEvent,
  type AgentExecutor,
  type ExecutionEventBus,
  type RequestContext,
} from "@a2a-js/sdk/server";

import { agentUrls } from "../../lib/agents/config";
import {
  buildUserSendMessageRequest,
  extractTextFromParts,
} from "../../lib/agents/message";
import { decideRoute } from "./router";
import { synthesizeAnswers } from "./synthesizer";

type Specialist = {
  name: string;
  url: string;
};

const specialists = {
  lady: {
    name: "Lady Ahorro",
    url: agentUrls.lady,
  },
  femi: {
    name: "Feminanzas",
    url: agentUrls.femi,
  },
};

const askSpecialist = async (specialist: Specialist, question: string) => {
  const factory = new ClientFactory();
  const client = await factory.createFromUrl(specialist.url);

  const result = await client.sendMessage(
    buildUserSendMessageRequest(question),
  );

  if (
    "status" in result &&
    result.status?.state === TaskState.TASK_STATE_FAILED
  ) {
    const errorMessage = result.status.message?.parts
      ? extractTextFromParts(result.status.message.parts)
      : "";

    throw new Error(
      errorMessage || `${specialist.name} specialist task failed.`,
    );
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
    throw new Error(`${specialist.name} returned no text artifact.`);
  }

  return {
    name: specialist.name,
    answer,
  };
};

export const superAgentExecutor: AgentExecutor = {
  execute: async (
    requestContext: RequestContext,
    eventBus: ExecutionEventBus,
  ): Promise<void> => {
    const { taskId, contextId, userMessage } = requestContext;

    const question = extractTextFromParts(userMessage.parts);

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
      const { route } = await decideRoute(question);

      const selectedSpecialists =
        route === "both"
          ? [specialists.lady, specialists.femi]
          : [specialists[route]];

      const answers = await Promise.all(
        selectedSpecialists.map((specialist) =>
          askSpecialist(specialist, question),
        ),
      );

      const answer =
        answers.length > 1
          ? await synthesizeAnswers(question, answers)
          : answers[0].answer;

      eventBus.publish(
        AgentEvent.artifactUpdate({
          taskId,
          contextId,
          artifact: {
            artifactId: `${taskId}-answer`,
            name: "Super agent answer",
            description: `Answer received from ${answers.map(({ name }) => name).join(" and ")}.`,
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
