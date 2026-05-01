import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen({ navigation }) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Terms & Conditions</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="bodyMedium" style={styles.text}>
          Welcome to CinePal! By signing up, you agree to the following terms and conditions.
          {'\n\n'}
          1. Usage of Service
          {'\n'}
          You agree to use CinePal for your personal entertainment. Any unauthorized distribution or reproduction of content is strictly prohibited.
          {'\n\n'}
          2. User Accounts
          {'\n'}
          You are responsible for maintaining the confidentiality of your account credentials. You must be at least 16 years old to create an account.
          {'\n\n'}
          3. Privacy
          {'\n'}
          We respect your privacy. Your data, including your birthday and profile picture, will only be used to personalize your experience and enforce age restrictions.
          {'\n\n'}
          4. Modifications
          {'\n'}
          CinePal reserves the right to modify these terms at any time. We will notify you of any significant changes.
          {'\n\n'}
          5. Termination
          {'\n'}
          We reserve the right to terminate accounts that violate these terms.
          {'\n\n'}
          Thank you for choosing CinePal!
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          I Understand
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontWeight: 'bold', color: '#F5F5F5' },
  content: { paddingHorizontal: 24 },
  text: { color: '#E0E0E0', lineHeight: 24 },
  footer: { padding: 24 },
  button: { borderRadius: 8 }
});
