import type { Network } from "@coinbase/agentkit";
import {
  CHAIN_ID_TO_NETWORK_ID,
  getChain,
  WalletProvider,
} from "@coinbase/agentkit";
import { base } from "viem/chains";
import type { MCPToolSessionData } from "../index";
import { createPublicClient, http } from "viem";

export class AgentKitWalletProvider extends WalletProvider {
  private session: MCPToolSessionData;

  constructor(session: MCPToolSessionData) {
    super();
    this.session = session;
  }

  getAddress(): string {
    return this.session.address;
  }

  getNetwork(): Network {
    return {
      networkId: CHAIN_ID_TO_NETWORK_ID[this.session.chainId],
      chainId: (this.session.chainId || base.id).toString(),
      protocolFamily: "ethereum",
    };
  }

  getName(): string {
    return "AgentKitWalletProvider";
  }

  async getBalance(): Promise<bigint> {
    const publicClient = createPublicClient({
      chain: getChain(this.session.chainId.toString()),
      transport: http(),
    });

    const balance = await publicClient.getBalance({
      address: this.getAddress() as `0x${string}`,
    });
    return balance;
  }

  async nativeTransfer(to: string, value: string): Promise<string> {
    const toolCallId = Math.random().toString(36).substring(2, 15);

    this.session.toolCall = {
      type: "tool-call",
      toolCallId,
      toolName: "generate-evm-tx",
      args: {
        transaction: {
          to,
          value,
          data: "0x",
        },
      },
      message: "Please confirm this transaction",
    };

    return Promise.resolve("The transcation payload has been sent for signing");
  }
  async signMessage(message: string): Promise<string> {
    console.log("AGENTKIT WALLET SIGN MESSAGE:", message);

    // Generate a unique ID for this tool call
    const toolCallId = Math.random().toString(36).substring(2, 15);

    this.session.toolCall = {
      type: "tool-call",
      toolCallId,
      toolName: "signMessage",
      args: {
        message,
      },
      message: "Please sign this message",
    };

    return Promise.resolve("The message has been sent for signing");
  }
}

export const buildAgentKitWallet = (session: MCPToolSessionData) => {
  return new AgentKitWalletProvider(session);
};
