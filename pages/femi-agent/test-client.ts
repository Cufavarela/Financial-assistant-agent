import { ClientFactory } from "@a2a-js/sdk/client";
import { Role } from "@a2a-js/sdk";

const main = async () => {
  const factory = new ClientFactory();

  const client = await factory.createFromUrl("http://localhost:3003");

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
            value: "¿Qué es Feminanzas?",
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

  console.log(JSON.stringify(result, null, 2));
};

main();
