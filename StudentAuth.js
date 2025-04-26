import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const StudentAuth = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Personal details state
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);

  const handleAuth = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate('StudentDashboard');
      } else {
        // Register new user - FIRST STEP ONLY
        await createUserWithEmailAndPassword(auth, email, password);
        setShowPersonalDetails(true); // Show personal details form
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalDetailsSubmit = async () => {
    if (!name || !rollNumber || !roomNumber || !department) {
      Alert.alert('Error', 'Please fill all personal details');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "students", user.uid), {
          name,
          email: user.email,
          rollNumber,
          roomNumber,
          department,
          createdAt: new Date(),
          status: "active"
        });
        navigation.navigate('StudentDashboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save personal details');
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
            <Text style={styles.title}>{isLogin ? 'Student Login' : 'Student Signup'}</Text>
            
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
              >
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Login' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Complete Your Profile</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Roll Number"
              placeholderTextColor="#aaa"
              value={rollNumber}
              onChangeText={setRollNumber}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Room Number"
              placeholderTextColor="#aaa"
              value={roomNumber}
              onChangeText={setRoomNumber}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Department"
              placeholderTextColor="#aaa"
              value={department}
              onChangeText={setDepartment}
            />
            
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <TouchableOpacity 
                style={styles.authButton}
                onPress={handlePersonalDetailsSubmit}
              >
                <Text style={styles.authButtonText}>Complete Registration</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

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
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: '#fff',
    fontSize: 16,
  },
  authButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 15,
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

export default StudentAuth;