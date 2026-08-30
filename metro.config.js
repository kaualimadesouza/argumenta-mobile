const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Test files are colocated inside src/app/ next to their routes. Without this,
// expo-router's require.context sweeps them into the production bundle, which
// then fails trying to resolve @testing-library/react-native's Node-only deps.
config.resolver.blockList = [...config.resolver.blockList, /\.test\.[jt]sx?$/];

module.exports = config;
