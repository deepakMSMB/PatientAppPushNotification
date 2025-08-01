import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useLogin } from '../api/auth/useLogin';
import { useCheckEmail } from '../api/auth/useCheckEmail';
import { saveAccessToken, savePatientId } from '../utils/mmkvStore';
import { useAuth } from '../components/AuthProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: checkEmail, isPending: isCheckingEmail } = useCheckEmail();
  const { checkAuth } = useAuth();

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailCheck = async () => {
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) return;

    try {
      const response = await checkEmail({ email });
      
      if (response.success) {
        if (Array.isArray(response.data)) {
          // User needs to verify email
          Alert.alert('User not found', 'Please sign up to continue', [{ text: 'OK' }]);
          return;
        } else {
          // User has a password
          setShowPasswordField(true);
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to verify email', [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify email. Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    try {
      const response = await login({ email, password });
      
      if (response.success && response.data) {
        saveAccessToken(response.data.token);
        savePatientId(response.data.patient_id);

        // Update auth state and navigate
        checkAuth();
        router.replace('/');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials', [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password.', [{ text: 'OK' }]);
    }
  };

  const handleBackPress = () => {
    setShowPasswordField(false);
    setPassword('');
    setPasswordError('');
  };

  return (
    <KeyboardAvoidingView 
          style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {showPasswordField ? 'Enter Password' : 'Login'}
          </Text>

          {!showPasswordField && (
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text.toLowerCase());
                  if (emailError) validateEmail(text.toLowerCase());
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
          )}

          {showPasswordField && (
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (isLoggingIn || isCheckingEmail) ? styles.buttonDisabled : null]}
            onPress={showPasswordField ? handleLogin : handleEmailCheck}
            disabled={isLoggingIn || isCheckingEmail}
          >
            <Text style={styles.buttonText}>
              {isLoggingIn || isCheckingEmail ? 'Loading...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {showPasswordField && (
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  passwordInput: {
    flex: 1,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  eyeButton: {
    padding: 15,
  },
  eyeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
