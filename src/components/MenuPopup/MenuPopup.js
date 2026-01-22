import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable
} from 'react-native';
import styles from './MenuPopup.styles';

export default function MenuPopup({
  visible,
  items,
  onClose,
  align = 'left'
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View
        style={[
          styles.overlay,
          align === 'left' ? styles.left : styles.right
        ]}
      >
        <View style={styles.menu}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.item,
                item.disabled && styles.disabled
              ]}
              disabled={item.disabled}
              onPress={() => {
                if (item.onPress) item.onPress();
                onClose();
              }}
            >
              <Text style={styles.text}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}
