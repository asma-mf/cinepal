// Sign-in screen using Clerk's useSignIn hook
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignIn, useClerk, useAuth } from '@clerk/expo';

export default function SignInScreen({ navigation }) {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const { isLoaded } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (msg) => setSnackbar({ visible: true, message: msg });

  const handleSignIn = async () => {
    if (!isLoaded) {
      showError('Clerk is not ready yet. Please try again.');
      return;
    }
    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result?.error) throw result.error;
      if (signIn.status === 'complete') {
        await setActive({ session: signIn.createdSessionId });
      } else {
        showError('Additional verification required.');
      }
    } catch (err) {
      const msg = err.errors?.[0]?.message || err.message || 'Sign in failed';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="movie-open" size={40} color="#fff" />
          </View>
          <Text style={styles.logoText}>CinePal</Text>
          <Text variant="bodyMedium" style={styles.tagline}>Your cinema experience, simplified.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text variant="headlineSmall" style={styles.formTitle}>Welcome back</Text>
          <Text variant="bodySmall" style={styles.formSubtitle}>Sign in to your account</Text>

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
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.linkButton}
            labelStyle={{ color: theme.colors.onSurfaceVariant }}
          >
            Don't have an account?{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Sign Up</Text>
          </Button>
        </View>
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

  logoSection: { alignItems: 'center', marginBottom: 40 },
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

  form: { gap: 4 },
  formTitle: { color: '#F5F5F5', fontWeight: '700', marginBottom: 4 },
  formSubtitle: { color: '#666', marginBottom: 20 },

  input: { marginBottom: 12, backgroundColor: 'transparent' },
  button: { marginTop: 8, borderRadius: 10 },
  buttonContent: { paddingVertical: 6 },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 12 },
});
