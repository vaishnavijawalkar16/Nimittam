import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import MenuPopup from '../MenuPopup/MenuPopup';
import styles from './TopBar.styles';
import { downloadModel } from '../../services/modelDownloadService';

import {
  getSavedModels,
  setActiveModel
} from '../../storage/modelStorage';
import { useTheme } from '../../theme/ThemeContext';

export default function TopBar({ onClearChat, onModelSelected }) {
  const { theme, toggleTheme } = useTheme();

  const [models, setModels] = useState([]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const refreshModels = async () => {
    const saved = await getSavedModels();
    setModels(saved || []);
  };

  useEffect(() => {
    refreshModels();
  }, []);



  const openDownload = async () => {
    let lastPercent = 0;
  
    Alert.alert(
      'Downloading Model',
      'Starting download...',
      [],
      { cancelable: false }
    );
  
    const model = await downloadModel(progress => {
      if (progress.percent !== lastPercent) {
        lastPercent = progress.percent;
        Alert.alert(
          'Downloading Model',
          `${progress.percent}% downloaded\n${progress.writtenMB} MB / ${progress.totalMB} MB`,
          [],
          { cancelable: false }
        );
      }
    });
  
    if (model) {
      Alert.alert('Success', 'Model downloaded successfully!');
      refreshModels();
    } else {
      Alert.alert('Error', 'Model download failed.');
    }
  };
  
  const modelMenuItems =
    models.length === 0
      ? [
          { label: 'No saved models', disabled: true },
          { label: 'Download Model', onPress: openDownload }
        ]
      : models.map(m => ({
          label: m.name,
          onPress: async () => {
            await setActiveModel(m);
            onModelSelected(m);
            Alert.alert('Model Selected', m.name);
          }
        }));

  return (
    <View style={[styles.container, { backgroundColor: theme.topBar }]}>
      <TouchableOpacity
        onPress={() => {
          setShowMoreMenu(false);
          setShowModelMenu(true);
        }}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Nimittam ▼
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setShowModelMenu(false);
          setShowMoreMenu(true);
        }}
      >
        <Text style={[styles.more, { color: theme.text }]}>⋮</Text>
      </TouchableOpacity>

      {showModelMenu && (
        <MenuPopup
          visible={showModelMenu}
          align="left"
          items={modelMenuItems}
          onClose={() => setShowModelMenu(false)}
        />
      )}

      {showMoreMenu && (
        <MenuPopup
          visible={showMoreMenu}
          align="right"
          items={[
            {
              label: 'Switch Theme',
              onPress: () => {
                toggleTheme();
              }
            },
            {
              label: 'Use Saved Model',
              onPress: () => {
                setShowMoreMenu(false);
                setShowModelMenu(true);
              }
            },
            {
              label: 'Clear Chat',
              onPress: onClearChat
            }
          ]}
          onClose={() => setShowMoreMenu(false)}
        />
      )}
    </View>
  );
}
