"use client";

import { useEnsName } from "wagmi";
import { useState, useEffect } from "react";

const ENS_KEY = "fundslip:ens:";

function readCache(address: string): string | null {
  try { return localStorage.getItem(ENS_KEY + address.toLowerCase()); } catch { return null; }
}

function writeCache(address: string, name: string | null) {
  try {
    if (name) localStorage.setItem(ENS_KEY + address.toLowerCase(), name);
    else localStorage.removeItem(ENS_KEY + address.toLowerCase());
  } catch { /* localStorage unavailable */ }
}

/**
 * Returns the ENS name for an address with aggressive caching:
 * - Reads from localStorage instantly (no network wait on reload)
 * - Updates localStorage when a fresh ENS name resolves
 * - Uses tanstack query cache with 24h staleTime (no refetch on page nav)
 */
export function useCachedEnsName(address: `0x${string}` | undefined): string | null {
  const { data: ensName } = useEnsName({
    address,
    chainId: 1, // ENS only exists on mainnet
    query: { enabled: !!address, staleTime: 1000 * 60 * 60 * 24, gcTime: Infinity },
  });

  const [cached, setCached] = useState<string | null>(() => {
    if (!address || typeof window === "undefined") return null;
    return readCache(address);
  });

  // Sync local state when address changes (different wallet)
  useEffect(() => {
    if (!address) { setCached(null); return; }
    setCached(readCache(address));
  }, [address]);

  // Persist when fresh ENS resolves (ensName is undefined while loading, null if no name)
  useEffect(() => {
    if (!address || ensName === undefined) return;
    writeCache(address, ensName);
    setCached(ensName);
  }, [address, ensName]);

  // Fresh value takes priority; fall back to localStorage cache while loading
  return ensName ?? cached;
}
