import { getOnChainTools } from "@goat-sdk/adapter-model-context-protocol";
import { USDC, WETH, erc20 } from "@goat-sdk/plugin-erc20";
import type { MCPToolSessionData } from "../index";
import { buildAdvancedWallet } from "./wallet";

// Define a type for the tool objects
type Tool = {
  name: string;
  description: string;
  inputSchema: unknown;
  execute: (params: unknown) => Promise<unknown>;
};

type ToolList = Tool[];

export const getTools = async (
  session: MCPToolSessionData
): Promise<ToolList> => {
  const onChainToolsAdapter = await getOnChainTools({
    plugins: [erc20({ tokens: [USDC, WETH] })],
    wallet: buildAdvancedWallet(session),
  });

  const rawTools = onChainToolsAdapter.listOfTools();

  // Transform the raw tools to include the execute method
  const tools = rawTools.map((tool) => ({
    ...tool,
    execute: async (params: unknown) => {
      console.log("tool", tool.name, params);

      try {
        // Execute the tool handler - this will now return immediately
        // for operations that require client interaction because they use the promise registry
        const result = await onChainToolsAdapter.toolHandler(tool.name, params);

        // Return the result along with the toolCall for client-side processing
        return {
          result,
          toolCall: session.toolCall,
        };
      } catch (error) {
        console.error(`Error executing tool ${tool.name}:`, error);

        // Re-throw the error
        throw error;
      }
    },
  }));

  return tools;
};
