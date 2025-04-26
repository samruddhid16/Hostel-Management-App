import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const VisitorApplication = ({ navigation }) => {
  const [visitorName, setVisitorName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date());
  const [relation, setRelation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!visitorName || !studentId || !relation || !phoneNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'visitorApplications'), {
        visitorName,
        studentId,
        visitDate: visitDate.toISOString(),
        relation,
        phoneNumber,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });

      Alert.alert('Success', 'Visitor application submitted for approval');
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting application: ", error);
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setVisitDate(selectedDate);
    }
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Visitor Application</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Visitor Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter visitor name"
            placeholderTextColor="#aaa"
            value={visitorName}
            onChangeText={setVisitorName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Student ID to Visit</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter student ID"
            placeholderTextColor="#aaa"
            value={studentId}
            onChangeText={setStudentId}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Visit Date & Time</Text>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {visitDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={visitDate}
              mode="datetime"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Relation with Student</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Parent, Friend, Relative"
            placeholderTextColor="#aaa"
            value={relation}
            onChangeText={setRelation}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor="#aaa"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Application</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VisitorApplication;