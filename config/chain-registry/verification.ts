import type { ChainDefinition, ChainVerification } from "./types.ts";

const VERIFICATION_KEYS: (keyof ChainVerification)[] = [
  "rpcVerified",
  "explorerVerified",
  "signingTested",
  "balanceDetectionTested",
  "tokenDetectionTested",
];

/** All verification gates must pass before real transactions are enabled. */
export function isFullyVerified(verification: ChainVerification): boolean {
  return VERIFICATION_KEYS.every((key) => verification[key] === true);
}

export function canEnableTransactions(chain: ChainDefinition): boolean {
  if (chain.chainId === null) return false;
  if (!chain.rpcUrls.length) return false;
  if (!chain.blockExplorerUrls.length) return false;
  if (chain.status === "planned") return false;
  return isFullyVerified(chain.verification);
}

/** Apply security gate: transactions only when every verification test passed. */
export function withTransactionGate(chain: ChainDefinition): ChainDefinition {
  const transactions = canEnableTransactions(chain);
  return {
    ...chain,
    capabilities: {
      ...chain.capabilities,
      transactions,
    },
  };
}

export function assertActivationRequirements(chain: ChainDefinition): string[] {
  const errors: string[] = [];
  if (chain.chainId === null) errors.push("missing chainId");
  if (!chain.rpcUrls.length) errors.push("missing RPC URL");
  if (!chain.blockExplorerUrls.length) errors.push("missing block explorer URL");
  if (!chain.tokenStandards.length && chain.status !== "planned") {
    errors.push("missing supported token standards");
  }
  return errors;
}
