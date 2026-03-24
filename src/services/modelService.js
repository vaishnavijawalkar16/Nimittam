import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const ACTIVE_MODEL_KEY = 'nimittam_active_model';
const MODEL_DIR = `${RNFS.DocumentDirectoryPath}/models`;

export const MODELS = {
  smollm: {
    id: 'smollm',
    name: 'Smol Model',
    filename: 'SmolLM2-360M-Instruct-Q8_0.gguf',
    url: 'https://huggingface.co/bartowski/SmolLM2-360M-Instruct-GGUF/resolve/main/SmolLM2-360M-Instruct-Q8_0.gguf'
  },

  gemma_vision: {
    id: 'gemma_vision',
    name: 'Gemma 3 (4B Vision)',
    filename: 'google_gemma-3-4b-it-Q4_K_M.gguf',
    url: 'https://huggingface.co/bartowski/google_gemma-3-4b-it-GGUF/resolve/main/google_gemma-3-4b-it-Q4_K_M.gguf',

    hasVision: true,

    visionFilename: 'mmproj-gemma-3-4b-f16.gguf',
    visionUrl: 'https://huggingface.co/bartowski/google_gemma-3-4b-it-GGUF/resolve/main/mmproj-gemma-3-4b-f16.gguf'
  }
};

let activeDownloadId = null;

export async function downloadModel(modelId, onProgress) {
  try {
    if (activeDownloadId !== null) {
      throw new Error('A download is already in progress');
    }

    const modelConfig = MODELS[modelId];
    if (!modelConfig) throw new Error('Invalid model selection');

    await RNFS.mkdir(MODEL_DIR);

    const filesToDownload = [{ url: modelConfig.url, name: modelConfig.filename }];
    if (modelConfig.hasVision) {
      filesToDownload.push({ url: modelConfig.visionUrl, name: modelConfig.visionFilename });
    }

    for (let i = 0; i < filesToDownload.length; i++) {
      const file = filesToDownload[i];
      const destPath = `${MODEL_DIR}/${file.name}`;

      const { jobId, promise } = RNFS.downloadFile({
        fromUrl: file.url,
        toFile: destPath,
        background: true,
        progress: (res) => {
          const filePercentage = (res.bytesWritten / res.contentLength) * 100;
          const overallPercentage = ((i / filesToDownload.length) * 100) + (filePercentage / filesToDownload.length);
          
          if (onProgress) {
            onProgress({
              percentage: Math.round(overallPercentage),
              written: res.bytesWritten,
              total: res.contentLength,
              currentFile: file.name
            });
          }
        },
      });

      activeDownloadId = jobId;
      await promise;
      activeDownloadId = null;
    }

    // Mark specific model as installed
    await AsyncStorage.setItem(`installed_${modelId}`, 'true');
    await AsyncStorage.setItem(ACTIVE_MODEL_KEY, modelId);
    return true;
  } catch (error) {
    activeDownloadId = null;
    if (error.message !== 'Download cancelled') {
      console.error('Error downloading model:', error);
    }
    throw error;
  }
}

export async function abortDownload() {
  if (activeDownloadId !== null) {
    try {
      RNFS.stopDownload(activeDownloadId);
    } catch (e) {}
    activeDownloadId = null;
  }
}

export async function isModelInstalled(modelId) {
  try {
    const v = await AsyncStorage.getItem(`installed_${modelId}`);
    
    // Fallback logic incase the file literally exists but async storage was cleared
    const modelConfig = MODELS[modelId];
    if (modelConfig) {
      let existCount = 0;
      let requiredCount = modelConfig.hasVision ? 2 : 1;
      
      if (await RNFS.exists(`${MODEL_DIR}/${modelConfig.filename}`)) {
        existCount++;
      }
      if (modelConfig.hasVision && await RNFS.exists(`${MODEL_DIR}/${modelConfig.visionFilename}`)) {
        existCount++;
      }
      
      if (existCount === requiredCount) {
        await AsyncStorage.setItem(`installed_${modelId}`, 'true');
        return true;
      }
    }
    
    return v === 'true';
  } catch (e) {
    return false;
  }
}

export async function useSavedModel(modelId) {
  try {
    const installed = await isModelInstalled(modelId);
    if (!installed) throw new Error(`${MODELS[modelId].name} is not installed`);
    await AsyncStorage.setItem(ACTIVE_MODEL_KEY, modelId);
    return true;
  } catch (e) {
    throw e;
  }
}

export async function getActiveModel() {
  try {
    return (await AsyncStorage.getItem(ACTIVE_MODEL_KEY)) || null;
  } catch (e) {
    return null;
  }
}

export async function getModelPath() {
  const activeId = await getActiveModel();
  if (!activeId || !MODELS[activeId]) {
    throw new Error('No active model selected');
  }
  return `${MODEL_DIR}/${MODELS[activeId].filename}`;
}

export async function getVisionModelPath() {
  const activeId = await getActiveModel();
  if (!activeId || !MODELS[activeId] || !MODELS[activeId].hasVision) {
    return null;
  }
  return `${MODEL_DIR}/${MODELS[activeId].visionFilename}`;
}
