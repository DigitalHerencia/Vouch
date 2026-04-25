"use client";

import { useCallback, useState } from "react";

export function useCopyToClipboard(timeoutMs = 1600) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (value: string) => {
      if (!navigator.clipboard) {
        setCopied(false);
        return false;
      }

      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, timeoutMs);

        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeoutMs],
  );

  return { copied, copy };
}
