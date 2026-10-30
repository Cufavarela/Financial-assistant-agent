export const agentUrls = {
  lady: process.env.LADY_AGENT_URL ?? "http://localhost:3001",
  femi: process.env.FEMI_AGENT_URL ?? "http://localhost:3003",
  super: process.env.SUPER_AGENT_URL ?? "http://localhost:3002",
} as const;

export const getListenPort = (url: string): number => {
  const port = Number(new URL(url).port);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Agent URL is missing a valid port: ${url}`);
  }
  return port;
};
