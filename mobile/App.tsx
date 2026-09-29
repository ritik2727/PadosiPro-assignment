import React, { useState } from 'react';
import { StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { VerifyOtpScreen } from './src/screens/VerifyOtpScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TaskCatalogueScreen } from './src/screens/TaskCatalogueScreen';
import { UrgencyScreen } from './src/screens/UrgencyScreen';
import { RequestSubmittedScreen } from './src/screens/RequestSubmittedScreen';

function MainNavigator() {
  const {
    isAuthenticated,
    hasProfile,
    isLoading,
    pendingEmail,
  } = useAuth();

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<
    'Auth' | 'VerifyOtp' | 'Profile' | 'Home' | 'TaskCatalogue' | 'Urgency' | 'RequestSubmitted'
  >('Auth');

  const [activeOtpEmail, setActiveOtpEmail] = useState<string>('');
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | undefined>();
  const [selectedTaskData, setSelectedTaskData] = useState<{
    category: string;
    serviceTitle: string;
    subServices: string[];
  } | null>(null);
  const [assignedLm, setAssignedLm] = useState('Pilot LM');
  const [catalogueInitialCategory, setCatalogueInitialCategory] = useState<string | undefined>();
  const [catalogueInitialQuery, setCatalogueInitialQuery] = useState<string | undefined>();

  // Determine active view when auth changes
  if (isLoading) {
    return <SplashScreen />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (currentScreen === 'VerifyOtp') {
      return (
        <VerifyOtpScreen
          email={activeOtpEmail || pendingEmail}
          initialPreviewUrl={activePreviewUrl}
          onBack={() => setCurrentScreen('Auth')}
          onVerified={(profileCompleted) => {
            if (profileCompleted) {
              setCurrentScreen('Home');
            } else {
              setCurrentScreen('Profile');
            }
          }}
        />
      );
    }

    return (
      <AuthScreen
        onNavigateToOtp={(email, previewUrl) => {
          setActiveOtpEmail(email);
          setActivePreviewUrl(previewUrl);
          setCurrentScreen('VerifyOtp');
        }}
        onNavigateToProfile={() => setCurrentScreen('Profile')}
        onNavigateToHome={() => setCurrentScreen('Home')}
      />
    );
  }

  // First-time user profile onboarding
  if (!hasProfile || currentScreen === 'Profile') {
    return (
      <ProfileScreen
        onSaved={() => {
          setCurrentScreen('Home');
        }}
      />
    );
  }

  // Task selection journey
  if (currentScreen === 'TaskCatalogue') {
    return (
      <TaskCatalogueScreen
        initialCategory={catalogueInitialCategory}
        initialQuery={catalogueInitialQuery}
        onBack={() => setCurrentScreen('Home')}
        onContinue={(selection) => {
          setSelectedTaskData(selection);
          setCurrentScreen('Urgency');
        }}
      />
    );
  }

  if (currentScreen === 'Urgency' && selectedTaskData) {
    return (
      <UrgencyScreen
        selection={selectedTaskData}
        onBack={() => setCurrentScreen('TaskCatalogue')}
        onSubmitted={(lmName) => {
          setAssignedLm(lmName);
          setCurrentScreen('RequestSubmitted');
        }}
      />
    );
  }

  if (currentScreen === 'RequestSubmitted') {
    return (
      <RequestSubmittedScreen
        lmName={assignedLm}
        onBackToHome={() => {
          setSelectedTaskData(null);
          setCurrentScreen('Home');
        }}
      />
    );
  }

  // Main Home Dashboard
  return (
    <HomeScreen
      onNavigateToTasks={(category, query) => {
        setCatalogueInitialCategory(category);
        setCatalogueInitialQuery(query);
        setCurrentScreen('TaskCatalogue');
      }}
      onLogout={() => {
        setCurrentScreen('Auth');
      }}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AuthProvider>
          <MainNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
