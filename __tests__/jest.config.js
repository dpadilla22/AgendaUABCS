module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(expo|@expo|expo-modules-core|react-native|react-native-.*|@react-native|@react-navigation|@testing-library)/)",
  ],
  setupFilesAfterEnv: ["./jestSetupFile.js"],
};
