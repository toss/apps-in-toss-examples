interface Window {
  ReactNativeWebView?: {
    postMessage: (message: string) => void;
  };
}

export function sendWebViewMessage<
  T extends Record<string, unknown> = Record<string, unknown>
>() {
  let _window = window as Window;

  return {
    post(data: T) {
      _window.ReactNativeWebView?.postMessage(JSON.stringify({ ...data }));
    },

    haptic() {
      _window.ReactNativeWebView?.postMessage(
        JSON.stringify({
          type: "haptic",
          payload: {
            play: true,
          },
        })
      );
    },
  };
}
