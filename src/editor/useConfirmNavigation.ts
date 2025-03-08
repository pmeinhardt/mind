import { useEffect } from "react";

// Prevent accidentally navigating away and losing changes
export function useConfirmNavigation(enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      window.addEventListener("beforeunload", listener);
      return () => window.removeEventListener("beforeunload", listener);
    }
  }, [enabled]);
}

function listener(event: BeforeUnloadEvent) {
  event.preventDefault();
}
