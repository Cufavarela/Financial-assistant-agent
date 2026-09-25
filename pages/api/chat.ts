import type { NextApiRequest, NextApiResponse } from "next";
import { makeRag } from "./rag";
import { getVectorStore } from "./vectorstore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = req.body;

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
    const vectorStore = await getVectorStore();

    const rag = await makeRag(vectorStore, (token) => {
      sendData(JSON.stringify({ data: token }));
    });

    await rag(body.question);
  } catch (err) {
    console.error(err);
  } finally {
    sendData("[DONE]");
    res.end();
  }
}
