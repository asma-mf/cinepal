// Sign-up screen using Clerk's useSignUp hook with a paged flow
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Snackbar, useTheme, Avatar, Checkbox, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignUp, useClerk, useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useSignUp();
  const { setActive, client } = useClerk();
  const { isLoaded } = useAuth();
  const theme = useTheme();

  // Paging state
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [username, setUsername] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [code, setCode] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (msg) => {
    console.log('Showing error:', msg);
    setSnackbar({ visible: true, message: msg });
    Alert.alert('Notice', String(msg));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleBirthdayChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
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

  const handleNext = () => {
    if (step === 1) {
      if (!email || !password || !confirmPassword) {
        showError('Please fill in all fields.');
        return;
      }
      if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        showError('Password must be at least 8 characters long.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!firstName || !lastName || !birthday) {
        showError('Please fill in all fields.');
        return;
      }
      const birthCheck = isValidBirthday(birthday);
      if (!birthCheck.valid) {
        showError(birthCheck.error);
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignUp = async () => {
    if (!isLoaded || !signUp) {
      showError('Clerk is not ready yet. Please try again.');
      return;
    }
    
    if (!username) {
      showError('Please choose a username.');
      return;
    }
    
    if (!termsAccepted) {
      showError('You must accept the Terms and Conditions to sign up.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await signUp.password({ 
        emailAddress: email, 
        password,
        firstName,
        lastName,
        username,
        unsafeMetadata: { birthday },
      });
      if (signUpError) {
        const msg = signUpError?.errors?.[0]?.message || signUpError?.message || 'Sign up failed';
        showError(String(msg));
        return;
      }
      
      // Send the email verification code
      const { error: verifyError } = await signUp.verifications.sendEmailCode();
      if (verifyError) {
        const msg = verifyError?.errors?.[0]?.message || verifyError?.message || 'Failed to send verification code';
        showError(String(msg));
        return;
      }
      
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
      if (error) {
        const msg = error?.errors?.[0]?.message || error?.message || 'Verification failed';
        showError(String(msg));
        return;
      }
      
      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: async ({ session }) => {
            await setActive({ session });
            
            // Upload profile picture if selected
            if (imageUri) {
              try {
                const activeSession = client.sessions.find(s => s.id === session.id);
                if (activeSession && activeSession.user) {
                  const response = await fetch(imageUri);
                  const blob = await response.blob();
                  await activeSession.user.setProfileImage({ file: blob });
                }
              } catch (e) {
                console.log('Failed to upload profile image during signup:', e);
              }
            }
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

  // Verification Screen
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

  // Paged Sign-Up Screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Step progress header — OUTSIDE ScrollView to prevent layout issues */}
      <View style={styles.headerRow}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#F5F5F5" />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
        <ProgressBar
          progress={step / 3}
          color="#E50914"
          style={styles.progressBar}
        />
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Image 
                source={require('../../assets/cinepal-high-res.png')} 
                style={styles.logoImage} 
                contentFit="contain"
              />
            </View>
            <Text variant="bodyMedium" style={[styles.tagline, { textAlign: 'center' }]}>Create your account</Text>
          </View>

          <View style={styles.form}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              {step === 1 && "Account Details"}
              {step === 2 && "Personal Info"}
              {step === 3 && "Complete Profile"}
            </Text>
            <Text variant="bodySmall" style={styles.formSubtitle}>
              Step {step} of 3
            </Text>

            {step === 1 && (
              <>
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
                  right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
                  style={styles.input}
                />
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  left={<TextInput.Icon icon="lock-check-outline" />}
                  right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off' : 'eye'} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                  style={styles.input}
                />
                <Button mode="contained" onPress={handleNext} style={styles.button} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel}>
                  Next
                </Button>
              </>
            )}

            {step === 2 && (
              <>
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
                
                <Button mode="contained" onPress={handleNext} style={styles.button} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel}>
                  Next
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.avatarSection}>
                  <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {imageUri ? (
                      <Avatar.Image size={100} source={{ uri: imageUri }} style={styles.avatar} />
                    ) : (
                      <Avatar.Icon size={100} icon="camera" style={styles.avatar} />
                    )}
                  </TouchableOpacity>
                  <Text variant="bodySmall" style={styles.avatarHint}>Add Profile Picture (Optional)</Text>
                </View>

                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="at" />}
                  style={styles.input}
                />

                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={termsAccepted ? 'checked' : 'unchecked'}
                    onPress={() => setTermsAccepted(!termsAccepted)}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" style={styles.checkboxLabel} onPress={() => setTermsAccepted(!termsAccepted)}>
                    I agree to the{' '}
                    <Text style={[styles.linkText, { color: theme.colors.primary }]} onPress={() => navigation.navigate('Terms')}>
                      Terms and Conditions
                    </Text>
                  </Text>
                </View>

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
              </>
            )}

            {step === 1 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('SignIn')}
                style={styles.linkButton}
                labelStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                Already have an account?{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Sign In</Text>
              </Button>
            )}
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
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 8 },

  // Header row is now OUTSIDE ScrollView — fixed width layout
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: { padding: 8 },
  progressBar: {
    flex: 1,
    marginHorizontal: 12,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2A2A2A',
  },

  logoSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  logoIcon: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: { width: 160, height: 60 },
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
  inner: { flex: 1, padding: 24 },

  form: { gap: 4 },
  formTitle: { color: '#F5F5F5', fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  formSubtitle: { color: '#666', marginBottom: 20, textAlign: 'center' },

  input: { marginBottom: 12, backgroundColor: 'transparent' },
  helperText: { color: '#666', marginTop: -8, marginBottom: 12, marginLeft: 4 },
  
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxLabel: { flex: 1, color: '#E0E0E0', marginLeft: 8 },
  linkText: { fontWeight: 'bold' },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative' },
  avatar: { backgroundColor: '#1C1C1C' },
  avatarHint: { color: '#666', marginTop: 8 },

  button: { marginTop: 8, borderRadius: 10 },
  buttonContent: { paddingVertical: 6 },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 12 },
});
