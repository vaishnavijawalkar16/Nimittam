/* eslint-disable no-undef */

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  mkdir: jest.fn(),
  exists: jest.fn(() => Promise.resolve(true)),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve({ statusCode: 200 }),
    jobId: 1
  })),
  stopDownload: jest.fn(),
  unlink: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

// Mock @xenova/transformers
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn(() => Promise.resolve(
    jest.fn((text, options) => {
      // Mock embeddings - return different vectors for different similarity
      const lowerText = text.toLowerCase();
      if (lowerText.includes('main entrance')) {
        return Promise.resolve({ data: [1, 0, 0] });
      } else if (lowerText.includes('parking')) {
        return Promise.resolve({ data: [0, 1, 0] });
      } else if (lowerText.includes('unrelated topic')) {
        return Promise.resolve({ data: [0, 0, 0] }); // Low similarity with all
      } else {
        // For other entries, return vectors with some similarity to main entrance
        return Promise.resolve({ data: [0.5, 0, 0.5] });
      }
    })
  ))
}));