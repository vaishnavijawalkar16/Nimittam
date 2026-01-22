import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from './MessageBubble.styles';
import { useTheme } from '../../theme/ThemeContext';

export default function MessageBubble({ message }) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.user : styles.bot,
        { backgroundColor: isUser ? theme.bubbleUser : theme.bubbleBot }
      ]}
    >
      {message.type === 'image' ? (
        <Image
          source={{ uri: message.uri }}
          style={{ width: 200, height: 200, borderRadius: 10 }}
        />
      ) : (
        <Text style={{ color: theme.text }}>{message.value}</Text>
      )}
    </View>
  );
}
