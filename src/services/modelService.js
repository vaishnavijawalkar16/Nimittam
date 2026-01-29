import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const INSTALLED_KEY = 'nimittam_model_installed';
const ACTIVE_MODEL_KEY = 'nimittam_active_model';
const MODEL_DIR = `${RNFS.DocumentDirectoryPath}/models`;
const MODEL_FILENAME = 'SmolLM2-360M-Instruct-Q8_0.gguf';

// Using SmolLM2-360M for better mobile performance
const FILE_URL = 'https://huggingface.co/bartowski/SmolLM2-360M-Instruct-GGUF/resolve/main/SmolLM2-360M-Instruct-Q8_0.gguf';

const FILES_TO_DOWNLOAD = [
  { url: FILE_URL, name: MODEL_FILENAME },
];

let activeDownloadId = null;

export async function downloadModel(onProgress) {
  try {
    // Check if already downloading
    if (activeDownloadId !== null) {
      throw new Error('Download already in progress');
    }

    // Create directories
    await RNFS.mkdir(MODEL_DIR);

    let totalBytesWritten = 0;
    let totalContentLength = 0;

    // First pass to get total content length (approximate)
    // For simplicity, we'll just track progress per file or use a hardcoded estimate if needed.
    // Let's just download sequentially.
    
    for (let i = 0; i < FILES_TO_DOWNLOAD.length; i++) {
      const file = FILES_TO_DOWNLOAD[i];
      const destPath = `${MODEL_DIR}/${file.name}`;

      const { jobId, promise } = RNFS.downloadFile({
        fromUrl: file.url,
        toFile: destPath,
        background: true,
        progress: (res) => {
          // This is a rough progress across all files
          const overallProgress = ((i / FILES_TO_DOWNLOAD.length) * 100) + 
                                  ((res.bytesWritten / res.contentLength) * (100 / FILES_TO_DOWNLOAD.length));
          
          if (onProgress) {
            onProgress({
              percentage: Math.round(overallProgress),
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

    await AsyncStorage.setItem(INSTALLED_KEY, 'true');
    await AsyncStorage.setItem(ACTIVE_MODEL_KEY, 'local');
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
    
    try {
      if (await RNFS.exists(MODEL_DIR)) {
        await RNFS.unlink(MODEL_DIR);
        console.log('Partial model directory removed');
      }
    } catch (e) {
      console.warn('Error cleaning up:', e);
    }
  }
}

export async function installModel() {
  return await downloadModel();
}

export async function isModelInstalled() {
  try {
    const v = await AsyncStorage.getItem(INSTALLED_KEY);
    return v === 'true';
  } catch (e) {
    return false;
  }
}

export async function useSavedModel() {
  try {
    const installed = await isModelInstalled();
    if (!installed) throw new Error('No saved model installed');
    await AsyncStorage.setItem(ACTIVE_MODEL_KEY, 'local');
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

export function getModelPath() {
  return `${MODEL_DIR}/${MODEL_FILENAME}`;
}
