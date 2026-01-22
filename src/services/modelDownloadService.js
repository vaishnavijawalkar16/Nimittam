import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storage/storageKeys';

const DOWNLOAD_URL =
  'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf?download=true';

export async function downloadModel(onProgress) {
  try {
    const basePath = `${RNFS.DocumentDirectoryPath}/models`;
    const modelPath = `${basePath}/tinyllama.gguf`;

    await RNFS.mkdir(basePath);

    const download = RNFS.downloadFile({
      fromUrl: DOWNLOAD_URL,
      toFile: modelPath,
      progressDivider: 1,
      progress: res => {
        const percent =
          (res.bytesWritten / res.contentLength) * 100;

        const speed =
          res.bytesWritten / 1024 / 1024; // MB written

        if (onProgress) {
          onProgress({
            percent: percent.toFixed(1),
            writtenMB: speed.toFixed(2),
            totalMB: (res.contentLength / 1024 / 1024).toFixed(2)
          });
        }
      }
    });

    const result = await download.promise;
    if (result.statusCode !== 200) return null;

    const model = {
      name: 'TinyLlama 1.1B',
      path: modelPath,
      format: 'gguf'
    };

    const saved =
      JSON.parse(
        (await AsyncStorage.getItem(STORAGE_KEYS.MODELS)) || '[]'
      );

    await AsyncStorage.setItem(
      STORAGE_KEYS.MODELS,
      JSON.stringify([...saved, model])
    );

    return model;
  } catch (e) {
    console.log('DOWNLOAD ERROR', e);
    return null;
  }
}
