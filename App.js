import React from 'react';
import { Alert, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ChatScreen from './src/screens/ChatScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';

import { clearMessages } from './src/storage/messageStorage';

function Main() {
  const { theme } = useTheme();
  const [selectedOccasion, setSelectedOccasion] = React.useState(null);
  const [currentLanguage, setCurrentLanguage] = React.useState('English');

  const onLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    Alert.alert('Language Switched', `The AI will now respond in ${lang}.`);
  };

  const clearChat = async () => {
    // ... (rest of clearChat remains same)
    if (selectedOccasion) {
       await clearMessages(selectedOccasion.id);
    }
  };

  if (!selectedOccasion) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <HomeScreen 
          onSelectOccasion={setSelectedOccasion} 
          onClearChat={clearChat}
          onLanguageChange={onLanguageChange}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ChatScreen 
        occasion={selectedOccasion} 
        onBack={() => setSelectedOccasion(null)} 
        onClearChatExternal={clearChat}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
