import { useEffect, useState } from "react";

type WebBLEResult = {
  supported: boolean;
  reason:
    | "ok"
    | "no_https"
    | "no_api"
    | "permission_denied"
    | "error"
    | "not_checked";
  loading: boolean;
};

export function useWebBLE(retryIntervalMs = 3000) {
  const [result, setResult] = useState<WebBLEResult>({
    supported: false,
    reason: "not_checked",
    loading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      setResult({
        supported: false,
        reason: "no_api",
        loading: false,
      });
      return;
    }

    let mounted = true;
    let intervalId: any = null;

    const check = async () => {
      try {
        // 1. Check HTTPS (required by WebBLE unless localhost)
        const isSecure =
          window.isSecureContext ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        if (!isSecure) {
          if (mounted)
            setResult({
              supported: false,
              reason: "no_https",
              loading: false,
            });
          return;
        }

        // 2. Check API presence
        if (!(navigator as any)?.bluetooth) {
          if (mounted)
            setResult({
              supported: false,
              reason: "no_api",
              loading: false,
            });
          return;
        }

        // 3. Optional: Check permission state
        let permissionAllowed = true;
        if (navigator.permissions?.query) {
          try {
            const perm = await navigator.permissions.query({
              name: "bluetooth" as PermissionName,
            });

            if (perm.state === "denied") permissionAllowed = false;
          } catch {
            // Safari/Firefox errors → ignore but assume allowed
          }
        }

        if (!permissionAllowed) {
          if (mounted)
            setResult({
              supported: false,
              reason: "permission_denied",
              loading: false,
            });
          return;
        }

        // If everything passed:
        if (mounted)
          setResult({
            supported: true,
            reason: "ok",
            loading: false,
          });
      } catch (err) {
        if (mounted)
          setResult({
            supported: false,
            reason: "error",
            loading: false,
          });
      }
    };

    // Run once immediately
    check();

    // Auto retry on interval only while unsupported
    intervalId = setInterval(() => {
      if (result.supported === false) check();
    }, retryIntervalMs);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // console.log("WebBLE status:", result);
  return result;
}

export default useWebBLE;