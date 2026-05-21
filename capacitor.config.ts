import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.4b3349f8172e427b8845cc58cbf83aa2",
  appName: "rag2rich",
  webDir: "dist",
  server: {
    url: "https://4b3349f8-172e-427b-8845-cc58cbf83aa2.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    AdMob: {
      // AdMob App ID — also goes in AndroidManifest.xml / Info.plist when adding native platforms
      appId: "ca-app-pub-9803076819193345~9013349574",
    },
  },
};

export default config;
