import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const LeaveApplication = () => {
  const [leaveReason, setLeaveReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const navigation = useNavigation();

  // Fetch student data when component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "students", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setStudentData(docSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, []);

  const validateDate = (dateStr) => {
    const pattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(20\d{2})$/;
    return pattern.test(dateStr);
  };

  const handleSubmit = async () => {

    if (!leaveReason || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
      
    }
    if (!validateDate(startDate) || !validateDate(endDate)) {
      Alert.alert('Error', 'Please enter dates in DD/MM/YYYY format');
      return;
    }

    if (!studentData) {
      Alert.alert('Error', 'Student data not loaded. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user && studentData) {
        await addDoc(collection(db, 'leaveApplications'), {
          studentId: user.uid,
          studentName: studentData.name || 'Student',
          rollNumber: studentData.rollNumber,
          department: studentData.department,
          roomNumber: studentData.roomNumber,
          reason: leaveReason,
          startDate, // Stored as string (DD/MM/YYYY)
          endDate,   // Stored as string (DD/MM/YYYY)
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Leave application submitted successfully');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting leave application:', error);
      Alert.alert('Error', 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Apply for Leave</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Start Date (DD/MM/YYYY)"
          placeholderTextColor="#aaa"
          value={startDate}
          onChangeText={setStartDate}
          keyboardType="numbers-and-punctuation"
        />
        
        <TextInput
          style={styles.input}
          placeholder="End Date (DD/MM/YYYY)"
          placeholderTextColor="#aaa"
          value={endDate}
          onChangeText={setEndDate}
          keyboardType="numbers-and-punctuation"
        />
        
        <TextInput
          style={[styles.input, styles.reasonInput]}
          placeholder="Reason for Leave"
          placeholderTextColor="#aaa"
          value={leaveReason}
          onChangeText={setLeaveReason}
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading || !studentData}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Text>
        </TouchableOpacity>

        {!studentData && (
          <Text style={styles.loadingText}>Loading student data...</Text>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
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
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  reasonInput: {
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LeaveApplication;