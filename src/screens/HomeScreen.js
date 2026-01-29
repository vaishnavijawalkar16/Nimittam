import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import styles from './HomeScreen.styles';
import { useTheme } from '../theme/ThemeContext';
import { OCCASIONS } from '../constants/occasions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TopBar from '../components/TopBar/TopBar';

export default function HomeScreen({ onSelectOccasion, onClearChat }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar onClearChat={onClearChat} />
      
      <ScrollView 
        contentContainerStyle={styles.listContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Select an occasion to begin your journey.
          </Text>
        </View>

        {OCCASIONS.map((occasion) => (
          <TouchableOpacity
            key={occasion.id}
            style={[
              styles.card,
              { 
                backgroundColor: theme.bubbleUser,
                borderColor: theme.dark ? '#333' : '#E0E0E0'
              }
            ]}
            onPress={() => onSelectOccasion(occasion)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{occasion.name}</Text>
              <Text style={[styles.cardDesc, { color: theme.text, opacity: 0.7 }]}>
                {occasion.description}
              </Text>
            </View>

            <Icon name="chevron-right" size={20} color={theme.text} style={styles.arrow} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
