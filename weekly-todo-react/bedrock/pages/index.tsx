import React, { useRef } from "react";
import { BedrockRoute, generateHapticFeedback } from "react-native-bedrock";
import { Platform } from "react-native";

import WebView from "@react-native-bedrock/native/react-native-webview";

export const Route = BedrockRoute("/", {
  validateParams: (params) => params,
  component: Index,
});

const WEBVIEW_URL = "http://YOUR_LOCAL_IP:3000/"; // ex: "http://192.168.1.100:3000/"
const platformOS = Platform.OS;

export function Index() {
  const webviewRef = useRef<WebView | null>(null);

  return (
    <WebView
      ref={webviewRef}
      style={{ flex: 1, backgroundColor: "#fff" }}
      source={{
        uri: WEBVIEW_URL,
      }}
      onMessage={async (event) => {
        const { type, payload } = JSON.parse(event.nativeEvent.data);

        switch (type) {
          case "haptic":
            if (payload.play) {
              generateHapticFeedback({ type: "softMedium" });
            }
            break;
          case "loaded":
            webviewRef.current?.postMessage(
              JSON.stringify({
                platformOS,
              })
            );
            break;
          default:
            console.warn("Unknown message type:", type);
        }
      }}
      overScrollMode="never"
      webviewDebuggingEnabled
    />
  );
}
