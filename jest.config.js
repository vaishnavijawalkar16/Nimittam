module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-fs|@xenova/transformers|react-native-get-random-values|react-native-vector-icons|react-native-image-picker)/)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js']
};
