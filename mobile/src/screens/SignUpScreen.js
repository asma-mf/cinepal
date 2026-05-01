// Sign-up screen using Clerk's useSignUp hook
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignUp, useClerk, useAuth } from '@clerk/expo';
import { Image } from 'expo-image';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const { isLoaded } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (msg) => {
    console.log('Showing error:', msg);
    setSnackbar({ visible: true, message: msg });
    Alert.alert('Notice', msg);
  };
  
  const handleBirthdayChange = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    
    // YYYY-MM-DD
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    
    setBirthday(formatted);
  };

  const isValidBirthday = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regex)) return { valid: false, error: 'Invalid format. Use YYYY-MM-DD' };

    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);

    // Check if components match (e.g. catches Feb 30th)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return { valid: false, error: 'That date does not exist in the calendar.' };
    }

    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }

    if (age < 16) return { valid: false, error: 'You must be at least 16 years old to join.' };
    if (age > 100) return { valid: false, error: 'Please enter a valid birth year.' };

    return { valid: true };
  };

  const handleSignUp = async () => {
    if (!isLoaded || !signUp) {
      showError('Clerk is not ready yet. Please try again.');
      return;
    }
    if (!email || !password || !firstName || !lastName || !birthday) {
      showError('Please fill in all fields.');
      return;
    }

    const birthCheck = isValidBirthday(birthday);
    if (!birthCheck.valid) {
      showError(birthCheck.error);
      return;
    }
    setLoading(true);
    try {
      const { error: signUpError } = await signUp.password({ 
        emailAddress: email, 
        password, 
        firstName, 
        lastName
      });
      if (signUpError) throw signUpError;
      
      const { error: updateError } = await signUp.update({
        unsafeMetadata: { birthday }
      });
      if (updateError) throw updateError;
      
      const { error: verifyError } = await signUp.verifications.sendEmailCode();
      if (verifyError) throw verifyError;
      
      setPendingVerification(true);
    } catch (err) {
      console.error('SignUp Error:', err);
      const msg = err?.errors?.[0]?.message || err?.message || 'Sign up failed';
      showError(String(msg));
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
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) throw error;
      
      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: async ({ session }) => {
            await setActive({ session });
          }
        });
      } else {
        showError('Verification incomplete. Status: ' + signUp.status);
      }
    } catch (err) {
      console.error('SignUp Verify Error:', err);
      const msg = err?.errors?.[0]?.message || err?.message || 'Verification failed';
      showError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const { error } = await signUp.verifications.sendEmailCode();
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
              <Image 
                source={require('../../assets/cinepal.png')} 
                style={styles.logoImage} 
                contentFit="contain"
              />
            </View>
            <Text variant="bodyMedium" style={[styles.tagline, { textAlign: 'center' }]}>Create your account</Text>
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
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              left={<TextInput.Icon icon="account-outline" />}
              style={styles.input}
            />

            <TextInput
              label="Birthday"
              value={birthday}
              onChangeText={handleBirthdayChange}
              mode="outlined"
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              maxLength={10}
              left={<TextInput.Icon icon="calendar-outline" />}
              style={styles.input}
            />
            <Text variant="bodySmall" style={styles.helperText}>Used to filter mature content preferences.</Text>
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
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 200,
    height: 80,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#F5F5F5', letterSpacing: 2, textAlign: 'center' },
  tagline: { color: '#666', marginTop: 4, textAlign: 'center' },

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
  formTitle: { color: '#F5F5F5', fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  formSubtitle: { color: '#666', marginBottom: 20, textAlign: 'center' },

  input: { marginBottom: 12, backgroundColor: 'transparent' },
  helperText: { color: '#666', marginTop: -8, marginBottom: 12, marginLeft: 4 },
  button: { marginTop: 8, borderRadius: 10 },
  buttonContent: { paddingVertical: 6 },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 12 },
});
