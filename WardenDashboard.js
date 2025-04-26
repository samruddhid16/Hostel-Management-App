import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const WardenDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRoomModalVisible, setRoomModalVisible] = useState(false);
  const [isAddStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [rollNumberToAdd, setRollNumberToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [wardenName, setWardenName] = useState('');

  // Fetch warden details and initialize data
  useEffect(() => {
    const fetchWardenDetails = async () => {
      try {
        const q = query(collection(db, 'wardens'), where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const wardenData = querySnapshot.docs[0].data();
          setWardenName(wardenData.name);
        }
      } catch (error) {
        console.error("Error fetching warden details: ", error);
      }
    };

    const initializeRooms = () => {
      const roomNumbers = [];
      for (let i = 1; i <= 10; i++) {
        roomNumbers.push({
          id: `A-${100 + i}`,
          number: `A-${100 + i}`,
          totalBeds: 4,
          students: []
        });
      }
      setRooms(roomNumbers);
    };

    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'));
        const querySnapshot = await getDocs(q);
        const studentsData = [];
        querySnapshot.forEach((doc) => {
          studentsData.push({ ...doc.data(), firebaseId: doc.id });
        });
        setStudents(studentsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students: ", error);
        Alert.alert("Error", "Failed to fetch students");
        setLoading(false);
      }
    };

    fetchWardenDetails();
    initializeRooms();
    fetchStudents();
  }, []);

  // Update room students when students data changes
  useEffect(() => {
    if (students.length > 0) {
      const updatedRooms = rooms.map(room => {
        const roomStudents = students
          .filter(student => student.roomNumber === room.number)
          .map(student => student.rollNumber);
        return { ...room, students: roomStudents };
      });
      setRooms(updatedRooms);
    }
  }, [students]);

  // Add student to room
  const handleAddStudent = async () => {
    if (!rollNumberToAdd.trim()) {
      Alert.alert('Error', 'Please enter student roll number');
      return;
    }

    try {
      const student = students.find(s => s.rollNumber === rollNumberToAdd.trim());
      if (!student) {
        Alert.alert('Error', 'Student not found');
        return;
      }

      if (student.roomNumber) {
        Alert.alert('Error', `Student is already assigned to room ${student.roomNumber}`);
        return;
      }

      await updateDoc(doc(db, 'students', student.firebaseId), {
        roomNumber: selectedRoom.number
      });

      const updatedStudents = students.map(s => 
        s.rollNumber === student.rollNumber ? { ...s, roomNumber: selectedRoom.number } : s
      );
      setStudents(updatedStudents);

      setRollNumberToAdd('');
      Alert.alert('Success', 'Student added to room successfully');
    } catch (error) {
      console.error("Error adding student: ", error);
      Alert.alert('Error', 'Failed to add student');
    }
  };

  // Remove student from room
  const handleRemoveStudent = async (rollNumber) => {
    try {
      const student = students.find(s => s.rollNumber === rollNumber);
      if (!student) return;

      await updateDoc(doc(db, 'students', student.firebaseId), {
        roomNumber: null
      });

      const updatedStudents = students.map(s => 
        s.rollNumber === rollNumber ? { ...s, roomNumber: null } : s
      );
      setStudents(updatedStudents);

      Alert.alert('Success', 'Student removed from room successfully');
    } catch (error) {
      console.error("Error removing student: ", error);
      Alert.alert('Error', 'Failed to remove student');
    }
  };

  // Get student details by rollNumber
  const getStudentDetails = (rollNumber) => {
    return students.find(student => student.rollNumber === rollNumber);
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome back, {wardenName}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      ) : (
        <>
          {/* Rooms Grid */}
          <ScrollView contentContainerStyle={styles.roomsContainer}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomCard,
                  room.students.length >= room.totalBeds && styles.occupiedRoom
                ]}
                onPress={() => {
                  setSelectedRoom(room);
                  setRoomModalVisible(true);
                }}
              >
                <Text style={styles.roomNumber}>Room {room.number}</Text>
                <Text style={styles.roomStatus}>
                  {room.students.length}/{room.totalBeds} beds
                </Text>
                <Ionicons 
                  name="bed-outline" 
                  size={24} 
                  color={room.students.length >= room.totalBeds ? '#ff6b6b' : '#51cf66'} 
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Room Details Modal */}
          <Modal visible={isRoomModalVisible} animationType="slide" transparent={false}>
            <LinearGradient
              colors={['#6a11cb', '#2575fc']}
              style={styles.modalContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Room {selectedRoom?.number} Details</Text>
                <TouchableOpacity onPress={() => setRoomModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Beds:</Text>
                <Text style={styles.detailValue}>{selectedRoom?.totalBeds}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Occupied:</Text>
                <Text style={styles.detailValue}>
                  {selectedRoom?.students.length} ({Math.round((selectedRoom?.students.length / selectedRoom?.totalBeds) * 100)}%)
                </Text>
              </View>

              <Text style={styles.studentsTitle}>Current Students:</Text>
              <ScrollView style={styles.studentsList}>
                {selectedRoom?.students.map((rollNumber, index) => {
                  const student = getStudentDetails(rollNumber);
                  return (
                    <View key={index} style={styles.studentItem}>
                      <View>
                        <Text style={styles.studentName}>{student?.name}</Text>
                        <Text style={styles.studentRoll}>Roll: {student?.rollNumber}</Text>
                        <Text style={styles.studentInfo}>Department: {student?.department}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveStudent(rollNumber)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  setRoomModalVisible(false);
                  setAddStudentModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Add Student</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Modal>

          {/* Add Student Modal */}
          <Modal visible={isAddStudentModalVisible} animationType="slide" transparent={false}>
            <LinearGradient
              colors={['#6a11cb', '#2575fc']}
              style={styles.modalContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Student to Room {selectedRoom?.number}</Text>
                <TouchableOpacity onPress={() => setAddStudentModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Student Roll Number"
                placeholderTextColor="#ccc"
                value={rollNumberToAdd}
                onChangeText={setRollNumberToAdd}
              />

              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAddStudent}
              >
                <Text style={styles.buttonText}>Add Student</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Modal>
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  roomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  roomCard: {
    width: '45%',
    margin: 8,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  occupiedRoom: {
    borderLeftWidth: 5,
    borderLeftColor: '#ff6b6b',
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  roomStatus: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#fff',
  },
  detailValue: {
    color: '#e0e0e0',
  },
  studentsTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
  studentsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    marginBottom: 5,
  },
  studentName: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
  },
  studentRoll: {
    color: '#e0e0e0',
    fontSize: 12,
  },
  studentInfo: {
    color: '#e0e0e0',
    fontSize: 12,
  },
  removeButton: {
    padding: 5,
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    color: '#fff',
  },
  loader: {
    marginTop: 50,
  },
});

export default WardenDashboard;