import { getChain } from "@coinbase/agentkit";
import {
  type Chain,
  type EvmChain,
  type Signature,
  type ToolBase,
  WalletClientBase,
} from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type {
  EVMReadRequest,
  EVMReadResult,
  EVMTransaction,
  EVMTypedData,
} from "@goat-sdk/wallet-evm";
import { http, createPublicClient, erc20Abi, formatUnits } from "viem";
import type { MCPToolSessionData } from "../index";

// Create a concrete implementation of WalletClientBase
class SimpleWallet extends WalletClientBase {
  private session: MCPToolSessionData;
  constructor(session: MCPToolSessionData) {
    super();
    this.session = session;
  }

  getAddress(): string {
    return this.session.address;
  }

  getChain(): Chain {
    // Use the original any type since we don't have access to the Chain type definition
    return {
      type: "evm",
      id: this.session.chainId,
    };
  }
  async signMessage(
    message: string
  ): Promise<{ signature: string; transactionURL: string }> {
    // Generate a unique ID for this tool call
    const toolCallId = Math.random().toString(36).substring(2, 15);

    this.session.toolCall = {
      type: "tool-call",
      toolCallId,
      toolName: "signMessage",
      args: {
        message,
        description: `Sign message: "${message}"`,
      },
      message: "Please sign this message",
    };

    return Promise.resolve({
      signature: "The message has been sent for signing",
      transactionURL: "The transaction has been sent for signing",
    });
  }

  async balanceOf(address: string): Promise<{
    decimals: number;
    symbol: string;
    name: string;
    value: string;
    inBaseUnits: string;
  }> {
    const client = createPublicClient({
      chain: getChain(this.session.chainId.toString()),
      transport: http(),
    });

    const [balance, symbol, name, decimals] = await Promise.all([
      client.readContract({
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      }),
      client.readContract({
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      }),
      client.readContract({
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "name",
      }),
      client.readContract({
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ]);

    return {
      decimals: Number(decimals),
      symbol: symbol as string,
      name: name as string,
      value: formatUnits(balance, decimals),
      inBaseUnits: balance.toString(),
    };
  }

  getCoreTools(): ToolBase[] {
    return [];
  }
}
export const buildWallet = (session: MCPToolSessionData) => {
  return new SimpleWallet(session);
};

class AdvancedWallet extends EVMWalletClient {
  private session: MCPToolSessionData;

  constructor(session: MCPToolSessionData) {
    super();
    this.session = session;
  }

  getAddress(): string {
    return this.session.address;
  }

  getChain(): EvmChain {
    return {
      type: "evm",
      id: this.session.chainId,
    };
  }

  async sendTransaction(
    transaction: EVMTransaction
  ): Promise<{ hash: string; transactionURL?: string }> {
    console.log("ADVANCED WALLET SEND TRANSACTION: ", transaction);

    // Generate a unique ID for this tool call
    const toolCallId = Math.random().toString(36).substring(2, 15);

    // Create the payload for generate-evm-tx tool
    this.session.toolCall = {
      type: "tool-call",
      toolCallId,
      toolName: "generate-evm-tx",
      args: {
        transaction,
      },
      message: "Execute this tool call and return the result",
    };
    console.log("TOOL CALL: ", this.session.toolCall);

    // Return the result provided by the client
    return {
      hash: "The transaction has been sent for signing",
      transactionURL: "The transaction has been sent for signing",
    };
  }

  async read(request: EVMReadRequest): Promise<EVMReadResult> {
    console.log("ADVANCED WALLET READ: ", request);

    const publicClient = createPublicClient({
      chain: getChain(this.session.chainId.toString()),
      transport: http(),
    });

    const result = await publicClient.readContract({
      ...request,
      address: request.address as `0x${string}`,
    });

    // For read operations, we can return immediately since they don't require client interaction
    return {
      value: result,
    };
  }

  async signTypedData(data: EVMTypedData): Promise<Signature> {
    console.log("ADVANCED WALLET SIGN TYPED DATA: ", data);

    // Generate a unique ID for this tool call
    const toolCallId = Math.random().toString(36).substring(2, 15);

    this.session.toolCall = {
      type: "tool-call",
      toolCallId,
      toolName: "signTypedData",
      args: data,
      message: "Please sign this typed data",
    };

    // Return the signature provided by the client
    return {
      signature: "The typed data has been sent for signing",
    };
  }

  async signMessage(
    message: string
  ): Promise<{ signature: string; transactionURL: string }> {
    console.log("ADVANCED WALLET SIGN MESSAGE: ", message);

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

    // Return the result provided by the client
    return {
      signature: "The message has been sent for signing",
      transactionURL: "The message has been sent for signing",
    };
  }

  async balanceOf(address: string): Promise<{
    decimals: number;
    symbol: string;
    name: string;
    value: string;
    inBaseUnits: string;
  }> {
    const publicClient = createPublicClient({
      chain: getChain(this.session.chainId.toString()),
      transport: http(),
    });

    const [balance, symbol, name, decimals] = await Promise.all([
      publicClient.readContract({
        address: address as `0x${string}`,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        abi: erc20Abi,
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        functionName: "symbol",
        abi: erc20Abi,
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        functionName: "name",
        abi: erc20Abi,
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        functionName: "decimals",
        abi: erc20Abi,
      }),
    ]);

    return {
      decimals: Number(decimals),
      symbol: symbol as string,
      name: name as string,
      value: formatUnits(balance, decimals),
      inBaseUnits: balance.toString(),
    };
  }

  getCoreTools(): ToolBase[] {
    return [];
  }
}

export const buildAdvancedWallet = (session: MCPToolSessionData) => {
  return new AdvancedWallet(session);
};
