import {
  AgentKit,
  compoundActionProvider,
  defillamaActionProvider,
  erc20ActionProvider,
  erc721ActionProvider,
  jupiterActionProvider,
  pythActionProvider,
  walletActionProvider,
  wethActionProvider,
  wowActionProvider,
} from "@coinbase/agentkit";
import { getMcpTools } from "@coinbase/agentkit-model-context-protocol";

import type { MCPToolSessionData } from "../index";
import { AgentKitWalletProvider } from "./wallet";

export const getTools = async (session: MCPToolSessionData) => {
  const walletProvider = new AgentKitWalletProvider(session);

  const agentKit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      walletActionProvider(),
      wowActionProvider(),
      wethActionProvider(),
      pythActionProvider(),
      //  openseaActionProvider(), // Requires API key
      compoundActionProvider(),
      jupiterActionProvider(),
      defillamaActionProvider(),
      erc20ActionProvider(),
      erc721ActionProvider(),
    ],
  });

  // Convert AgentKit tools to MCP-compatible format
  const { tools, toolHandler } = await getMcpTools(agentKit);

  const formattedTools = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    execute: async (params: Record<string, unknown>) => {
      console.log(tool.name, params);
      try {
        // Execute the tool handler
        const result = await toolHandler(tool.name, params);

        // Return the result along with the toolCall for client-side processing
        return {
          result,
          toolCall: session.toolCall,
        };
      } catch (error) {
        console.error(`Error executing tool ${tool.name}:`, error);
        throw error;
      }
    },
  }));
  return formattedTools;
};
