import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

export const getSavedModels = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MODELS);
  return data ? JSON.parse(data) : [];
};

export const saveModel = async model => {
  const models = await getSavedModels();
  await AsyncStorage.setItem(
    STORAGE_KEYS.MODELS,
    JSON.stringify([...models, model])
  );
};

export const setActiveModel = async model => {
  await AsyncStorage.setItem(
    STORAGE_KEYS.ACTIVE_MODEL,
    JSON.stringify(model)
  );
};

export const getActiveModel = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_MODEL);
  return data ? JSON.parse(data) : null;
};
