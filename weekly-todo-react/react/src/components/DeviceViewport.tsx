import { useEffect } from "react";
import useWebViewReceiver from "../hooks/useWebViewReceiver";
import { sendWebViewMessage } from "../utils/sendWebViewMessage";

export default function DeviceViewport() {
  const message = sendWebViewMessage();
  const data = useWebViewReceiver<{
    platformOS: string;
  }>();

  useEffect(() => {
    message.post({ type: "loaded" });
  }, []);

  useEffect(() => {
    if (data?.platformOS === "ios") {
      document.documentElement.style.setProperty(
        "--bottom-padding",
        `max(env(safe-area-inset-bottom), 20px)`
      );
    }

    document.documentElement.style.setProperty(
      "--min-height",
      `${window.innerHeight}px`
    );
  }, [data]);

  return null;
}
