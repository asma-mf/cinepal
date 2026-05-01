// Sign-in screen using Clerk's useSignIn hook
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn, useClerk, useAuth } from '@clerk/expo';

export default function SignInScreen({ navigation }) {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const { isLoaded } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) {
      Alert.alert('Error', 'Clerk is not loaded yet. Please check your configuration.');
      return;
    }
    setLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      const result = await signIn.create({ identifier: email, password });
      
      if (result?.error) {
        throw result.error;
      }

      if (signIn.status === 'complete') {
        await setActive({ session: signIn.createdSessionId });
      } else {
        console.warn('Sign in incomplete status:', signIn.status);
        Alert.alert('Sign In', 'Additional verification required');
      }
    } catch (err) {
      console.error('Sign in error:', JSON.stringify(err, null, 2));
      const msg = err.errors?.[0]?.message || err.message || 'Sign in failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>CinePal</Text>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#e50914', textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: { backgroundColor: '#e50914', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
});
