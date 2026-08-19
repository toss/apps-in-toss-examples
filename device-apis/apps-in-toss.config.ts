import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "device-apis",
  brand: {
    primaryColor: "#3182F6",
  },
  webView: {},
  permissions: [
    { name: "camera", access: "access" },
    { name: "photos", access: "read" },
    { name: "clipboard", access: "read" },
    { name: "clipboard", access: "write" },
    { name: "contacts", access: "read" },
    { name: "geolocation", access: "access" },
  ],
  webBundleDir: "dist",
});
