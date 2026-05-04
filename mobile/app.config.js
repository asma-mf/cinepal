export default {
  expo: {
    name: "Cinepal",
    slug: "cinepal-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/playstore-icon.png",
    userInterfaceStyle: "dark",
    experiments: {
      reactCompiler: true
    },
    splash: {
      image: "./assets/playstore-transparent.png",
      resizeMode: "contain",
      backgroundColor: "#1B140D"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kavindunirmal.cinepal",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription: "This app needs access to your photos to save your movie tickets.",
        NSPhotoLibraryAddUsageDescription: "This app needs access to your photos to save your movie tickets."
      }
    },
    android: {
      // Use the EAS Secret if available, otherwise fallback to local file
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/playstore-icon.png",
        backgroundColor: "#1B140D"
      },
      package: "com.kavindunirmal.cinepal"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-secure-store",
      "expo-notifications",
      "expo-media-library",
      [
        "expo-image",
        {
          "disableLibdav1d": true
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "5f1a839a-499b-4967-aa2f-4915a42dba1b"
      }
    }
  }
};
