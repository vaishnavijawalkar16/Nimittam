import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MenuPopup from '../MenuPopup/MenuPopup';
import styles from './TopBar.styles';
import { useTheme } from '../../theme/ThemeContext';
import { downloadModel, useSavedModel, abortDownload } from '../../services/modelService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TopBar({ onClearChat, occasion, onBack, onModelStatusChange }) {
  const { theme, toggleTheme } = useTheme();

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLeftMenu, setShowLeftMenu] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null); // { percentage, written, total }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startDownload = async () => {
    try {
      setDownloadProgress({ percentage: 0, written: 0, total: 0 });
      await downloadModel((progress) => {
        setDownloadProgress(progress);
      });
      setDownloadProgress(null);
      Alert.alert('Success', 'Model downloaded successfully!');
      if (onModelStatusChange) onModelStatusChange();
    } catch (error) {
      setDownloadProgress(null);
      // Check for common cancellation error messages
      const isCancelled = error.message === 'Download cancelled' || 
                         error.message === 'cancelled' ||
                         error.code === 'ERR_CANCELED';
      
      if (!isCancelled) {
        Alert.alert('Error', 'Failed to download model: ' + error.message);
      }
    }
  };

  const handleAbort = async () => {
    await abortDownload();
    setDownloadProgress(null);
    Alert.alert('Cancelled', 'Model download stopped.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.topBar }]}>
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.titleRow}
          onPress={() => setShowLeftMenu(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text 
            style={[styles.title, { color: theme.text }]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {occasion ? occasion.name : 'Nimittam'}
          </Text>
          {occasion && (
            <Icon name="chevron-down" size={20} color={theme.text} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>


      <View style={styles.rightSection}>
        {downloadProgress !== null && (
          <View style={styles.progressInfo}>
            <View style={styles.textContainer}>
              <Text style={[styles.percentageText, { color: theme.accent || '#6B4EFF' }]}>
                {downloadProgress.percentage}%
              </Text>
              <Text style={[styles.bytesText, { color: theme.text }]}>
                {formatBytes(downloadProgress.written)} / {formatBytes(downloadProgress.total)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleAbort} style={styles.cancelButton}>
              <Icon name="close-circle" size={20} color={theme.error || '#FF4D4D'} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setShowMoreMenu(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="dots-vertical" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {downloadProgress !== null && (
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${downloadProgress.percentage}%`,
                backgroundColor: theme.accent || '#6B4EFF',
              }
            ]} 
          />
        </View>
      )}

      {showLeftMenu && (
        <MenuPopup
          visible={showLeftMenu}
          align="left"
          items={[
            {
              label: 'Download Model',
              onPress: startDownload
            },
            {
              label: 'Use Saved Model',
              onPress: async () => {
                try {
                  await useSavedModel();
                  Alert.alert('Success', 'Model is now active.');
                  if (onModelStatusChange) onModelStatusChange();
                } catch (e) {
                  Alert.alert('Error', 'No saved model found. Please download first.');
                }
              }
            }
          ]}
          onClose={() => setShowLeftMenu(false)}
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
            ...(onClearChat ? [{
              label: 'Clear Chat',
              onPress: onClearChat
            }] : [])
          ].filter(Boolean)}
          onClose={() => setShowMoreMenu(false)}
        />
      )}
    </View>
  );
}

