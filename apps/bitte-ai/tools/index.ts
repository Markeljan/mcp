import type { ToolCall } from "..";
import { getTools as getBaseAgentkitTools } from "./base-agentkit";
import { getTools as getGoatTools } from "./goat-sdk";

// Define a type that encompasses all session data types
export type MCPToolSessionData = {
  id: string;
  address: string;
  chainId: number;
  accountId: string;
  toolCall?: ToolCall;
};

// Service interface for better typing
export interface ToolService {
  name: string;
  tools: (session: MCPToolSessionData) => Promise<any[]>;
}

// Type-safe services object
export const services: Record<string, ToolService> = {
  goat: {
    name: "goat",
    tools: getGoatTools,
  },
  agentkit: {
    name: "agentkit",
    tools: getBaseAgentkitTools,
  },
};
