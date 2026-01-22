import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

export const loadMessages = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
};

export const saveMessages = async messages => {
  await AsyncStorage.setItem(
    STORAGE_KEYS.MESSAGES,
    JSON.stringify(messages)
  );
};

export const clearMessages = async () => {
  await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
};
