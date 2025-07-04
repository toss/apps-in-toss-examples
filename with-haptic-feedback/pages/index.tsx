import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { BedrockRoute } from 'react-native-bedrock';
import { Text } from '@toss-design-system/react-native';
import { HapticFeedbackButton } from 'components/HapticFeedbackButton';

export const Route = BedrockRoute('/', {
  validateParams: (params) => params,
  component: Index,
});

export function Index() {
  return (
    <View style={styles.container}>
      <Text typography="st5" fontWeight="extraBold" style={styles.title}>
        진동 알림 예제
      </Text>
      <ScrollView bounces contentContainerStyle={styles.scrollView}>
        <HapticFeedbackButton label="Tick Weak" type="tickWeak" />
        <HapticFeedbackButton label="Tap" type="tap" />
        <HapticFeedbackButton label="Tick Medium" type="tickMedium" />
        <HapticFeedbackButton label="Soft Medium" type="softMedium" />
        <HapticFeedbackButton label="Basic Weak" type="basicWeak" />
        <HapticFeedbackButton label="Basic Medium" type="basicMedium" />
        <HapticFeedbackButton label="Success" type="success" />
        <HapticFeedbackButton label="Error" type="error" />
        <HapticFeedbackButton label="Wiggle" type="wiggle" />
        <HapticFeedbackButton label="Confetti" type="confetti" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 10,
    marginBottom: 20,
  },
  scrollView: {
    gap: 12,
    paddingBottom: 20,
  },
});
