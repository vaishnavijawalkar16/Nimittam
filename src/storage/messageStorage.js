import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

export const loadMessages = async (occasionId) => {
  const key = STORAGE_KEYS.MESSAGES_PREFIX + occasionId;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveMessages = async (occasionId, messages) => {
  const key = STORAGE_KEYS.MESSAGES_PREFIX + occasionId;
  await AsyncStorage.setItem(key, JSON.stringify(messages));
};

export const clearMessages = async (occasionId) => {
  const key = STORAGE_KEYS.MESSAGES_PREFIX + occasionId;
  await AsyncStorage.removeItem(key);
};
