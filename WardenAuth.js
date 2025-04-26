import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const WardenAuth = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Warden details
  const [name, setName] = useState('');
  const [wardenId, setWardenId] = useState('');
  const [hostelBlock, setHostelBlock] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);

  const handleAuth = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login existing warden
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate('WardenDashboard');
      } else {
        // Register new warden - first step
        await createUserWithEmailAndPassword(auth, email, password);
        setShowPersonalDetails(true);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalDetailsSubmit = async () => {
    if (!name || !wardenId || !hostelBlock || !contactNumber) {
      Alert.alert('Error', 'Please fill all warden details');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "wardens", user.uid), {
          name,
          email: user.email,
          wardenId,
          hostelBlock,
          contactNumber,
          role: "warden",
          createdAt: new Date(),
          status: "active"
        });
        navigation.navigate('WardenDashboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save warden details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error) => {
    let errorMessage = 'Authentication failed';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email already in use';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Invalid email or password';
        break;
    }
    Alert.alert('Error', errorMessage);
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!showPersonalDetails ? (
          <>
            <Text style={styles.title}>{isLogin ? 'Warden Login' : 'Warden Registration'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <TouchableOpacity 
                style={styles.authButton}
                onPress={handleAuth}
                disabled={loading}
              >
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Login' : 'Continue to Warden Details'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Warden Details</Text>
            <Text style={styles.subtitle}>Please provide your information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Warden ID"
              placeholderTextColor="#aaa"
              value={wardenId}
              onChangeText={setWardenId}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Hostel Block"
              placeholderTextColor="#aaa"
              value={hostelBlock}
              onChangeText={setHostelBlock}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              placeholderTextColor="#aaa"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
            
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <TouchableOpacity 
                style={styles.authButton}
                onPress={handlePersonalDetailsSubmit}
                disabled={loading}
              >
                <MaterialIcons name="admin-panel-settings" size={20} color="#fff" />
                <Text style={styles.authButtonText}> Complete Registration</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

// Reuse the same styles as FacultyAuth
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  authButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    marginTop: 20,
    color: '#fff',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default WardenAuth;