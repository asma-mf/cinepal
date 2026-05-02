// Sign-in screen using Clerk's useSignIn hook
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignIn, useClerk, useAuth } from '@clerk/expo';
import { Image } from 'expo-image';

export default function SignInScreen({ navigation }) {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const { isLoaded } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (msg) => {
    console.log('Showing error:', msg);
    setSnackbar({ visible: true, message: msg });
    Alert.alert('Notice', msg);
  };

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
      // Check if there's already an active sign-in flow that needs verification
      if (signIn.status === 'needs_first_factor' || signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
        const { error: sendErr } = await signIn.emailCode.sendCode({ emailAddress: email });
        if (sendErr) throw sendErr;
        setPendingVerification(true);
        setLoading(false);
        return;
      }

      const { error } = await signIn.password({ emailAddress: email, password });
      
      if (error) {
        throw error;
      }
      
      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: async ({ session }) => {
            await setActive({ session });
          }
        });
      } else if (signIn.status === 'needs_first_factor' || signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
        // Send email code for verification
        const { error: sendErr } = await signIn.emailCode.sendCode({ emailAddress: email });
        if (sendErr) throw sendErr;
        setPendingVerification(true);
      } else {
        showError(`Sign-in status: ${signIn.status || 'unknown'}. Please check your credentials.`);
      }
    } catch (err) {
      console.error('SignIn Error:', err);
      const msg = err?.errors?.[0]?.message || err?.message || 'Sign in failed';
      showError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      // Verify using emailCode in v3
      const { error } = await signIn.emailCode.verifyCode({ code });
      
      if (error) {
        throw error;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: async ({ session }) => {
            await setActive({ session });
          }
        });
      } else {
        showError('Verification incomplete. Status: ' + signIn.status);
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Verification failed';
      showError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const { error } = await signIn.emailCode.sendCode({ emailAddress: email });
      if (error) throw error;
      showError('A new verification code has been sent.');
    } catch (err) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Failed to resend code';
      showError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.inner}>
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Image source={require('../../assets/cinepal-high-res.png')} style={styles.logoImage} contentFit="contain" />
            </View>
            <Text variant="headlineSmall" style={styles.formTitle}>Verification Required</Text>
            <Text variant="bodyMedium" style={styles.formSubtitle}>Enter the code sent to your email</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              keyboardType="numeric"
              maxLength={6}
              left={<TextInput.Icon icon="numeric" />}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={loading}
              disabled={loading || code.length < 6}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Verify & Sign In
            </Button>

            <Button 
              mode="outlined" 
              onPress={handleResend} 
              loading={loading}
              disabled={loading}
              style={[styles.button, { marginTop: 12 }]}
              labelStyle={{ color: theme.colors.onSurface }}
            >
              Resend Code
            </Button>

            <Button mode="text" onPress={() => setPendingVerification(false)} style={styles.linkButton}>
              Back to Sign In
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Image 
              source={require('../../assets/cinepal.png')} 
              style={styles.logoImage} 
              contentFit="contain"
            />
          </View>
          <Text variant="bodyMedium" style={[styles.tagline, { textAlign: 'center' }]}>Your cinema experience, simplified.</Text>
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
    width: 200,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#F5F5F5', letterSpacing: 2, textAlign: 'center' },
  tagline: { color: '#666', marginTop: 4, textAlign: 'center' },

  form: { gap: 4 },
  formTitle: { color: '#F5F5F5', fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  formSubtitle: { color: '#666', marginBottom: 20, textAlign: 'center' },

  input: { marginBottom: 12, backgroundColor: 'transparent' },
  button: { marginTop: 8, borderRadius: 10 },
  buttonContent: { paddingVertical: 6 },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 12 },
});
