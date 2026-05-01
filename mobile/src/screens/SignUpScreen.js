// Sign-up screen using Clerk's useSignUp hook
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignUp, useClerk, useAuth } from '@clerk/expo';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const { isLoaded } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (msg) => setSnackbar({ visible: true, message: msg });

  const handleSignUp = async () => {
    if (!isLoaded || !signUp) {
      showError('Clerk is not ready yet. Please try again.');
      return;
    }
    if (!email || !password || !firstName) {
      showError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await signUp.create({ emailAddress: email, password, firstName });
      if (response?.error) throw response.error;
      const verifyResponse = await signUp.verifications.sendEmailCode();
      if (verifyResponse?.error) throw verifyResponse.error;
      setPendingVerification(true);
    } catch (err) {
      const msg = err.errors?.[0]?.message || err.message || 'Sign up failed';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    if (!code) {
      showError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.verifications.verifyEmailCode({ code });
      if (result?.error) throw result.error;
      if (signUp.status === 'complete') {
        await setActive({ session: signUp.createdSessionId });
      } else {
        showError('Verification incomplete. Status: ' + signUp.status);
      }
    } catch (err) {
      const msg = err.errors?.[0]?.message || err.message || 'Verification failed';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.inner}>
          <View style={styles.verifyHeader}>
            <View style={styles.verifyIconWrapper}>
              <MaterialCommunityIcons name="email-check-outline" size={40} color="#E50914" />
            </View>
            <Text variant="headlineSmall" style={styles.formTitle}>Check your email</Text>
            <Text variant="bodyMedium" style={styles.formSubtitle}>
              We sent a 6-digit code to{'\n'}<Text style={{ color: '#F5F5F5', fontWeight: '600' }}>{email}</Text>
            </Text>
          </View>

          <TextInput
            label="Verification Code"
            value={code}
            onChangeText={setCode}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="shield-key-outline" />}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleVerify}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Verify & Continue
          </Button>
        </View>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3500}
        >
          {snackbar.message}
        </Snackbar>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="movie-open" size={40} color="#fff" />
            </View>
            <Text style={styles.logoText}>CinePal</Text>
            <Text variant="bodyMedium" style={styles.tagline}>Create your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text variant="headlineSmall" style={styles.formTitle}>Get started</Text>
            <Text variant="bodySmall" style={styles.formSubtitle}>Join thousands of movie lovers</Text>

            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              left={<TextInput.Icon icon="account-outline" />}
              style={styles.input}
            />
            <TextInput
              label="Email address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" />}
              style={styles.input}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Create Account
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('SignIn')}
              style={styles.linkButton}
              labelStyle={{ color: theme.colors.onSurfaceVariant }}
            >
              Already have an account?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Sign In</Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3500}
        action={{ label: 'OK', onPress: () => setSnackbar({ ...snackbar, visible: false }) }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },

  logoSection: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#E50914',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#F5F5F5', letterSpacing: -0.5 },
  tagline: { color: '#666', marginTop: 4 },

  verifyHeader: { alignItems: 'center', marginBottom: 32 },
  verifyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229,9,20,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  form: { gap: 4 },
  formTitle: { color: '#F5F5F5', fontWeight: '700', marginBottom: 4 },
  formSubtitle: { color: '#666', marginBottom: 20, textAlign: 'center' },

  input: { marginBottom: 12, backgroundColor: 'transparent' },
  button: { marginTop: 8, borderRadius: 10 },
  buttonContent: { paddingVertical: 6 },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 12 },
});
