import { useEffect, useState } from "react";

interface CustomEvent extends Event {
  data?: string;
}

export default function useWebViewReceiver<
  T extends Record<string, unknown>
>() {
  const [messageData, setMessageData] = useState<T | null>(null);

  const getMessageData = (event: CustomEvent) => {
    if (typeof event.data !== "string") return;
    const data = JSON.parse(event.data);
    setMessageData(data);
  };

  useEffect(() => {
    document.addEventListener("message", getMessageData);
    window.addEventListener("message", getMessageData);

    return () => {
      document.removeEventListener("message", getMessageData);
      window.removeEventListener("message", getMessageData);
    };
  }, []);

  return messageData;
}
