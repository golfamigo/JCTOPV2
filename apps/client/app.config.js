module.exports = {
  expo: {
    name: "jctop-event-client",
    slug: "jctop-event-client",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to camera to scan QR codes for event check-in."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: ["CAMERA"]
    },
    plugins: [
      [
        "expo-router",
        {
          root: "./src/app"
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera to scan QR codes for event check-in."
        }
      ]
    ],
    scheme: "jctop-event",
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png",
      output: "single"
    },
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true
    }
  }
};