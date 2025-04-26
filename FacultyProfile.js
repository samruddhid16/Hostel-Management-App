import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const FacultyProfile = () => {
  const [facultyData, setFacultyData] = useState({
    name: '',
    facultyId: '',
    department: ''
  });
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const facultyRef = doc(db, 'faculty', auth.currentUser.uid);
        const docSnap = await getDoc(facultyRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFacultyData(data);
          setEditData(data);
        } else {
          Alert.alert('Error', 'Faculty data not found');
        }
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        Alert.alert('Error', 'Failed to load faculty data');
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'faculty', auth.currentUser.uid), editData);
      setFacultyData(editData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error("Error updating faculty data:", error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData(facultyData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="account-circle" size={100} color="#fff" />
            </View>
            
            {isEditing ? (
              <TextInput
                style={[styles.name, styles.editInput]}
                value={editData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            ) : (
              <Text style={styles.name}>{facultyData.name}</Text>
            )}
            
            <Text style={styles.designation}>
              {isEditing ? 'Edit Mode' : facultyData.department}
            </Text>
          </View>

          {/* Profile Details Card */}
          <View style={styles.detailsCard}>
            {/* Faculty ID Field */}
            <View style={styles.detailRow}>
              <MaterialIcons name="badge" size={24} color="#6a11cb" style={styles.detailIcon} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Faculty ID</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editData.facultyId}
                    onChangeText={(text) => handleChange('facultyId', text)}
                  />
                ) : (
                  <Text style={styles.detailValue}>{facultyData.facultyId}</Text>
                )}
              </View>
            </View>

            {/* Department Field */}
            <View style={styles.detailRow}>
              <MaterialIcons name="school" size={24} color="#6a11cb" style={styles.detailIcon} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Department</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editData.department}
                    onChangeText={(text) => handleChange('department', text)}
                  />
                ) : (
                  <Text style={styles.detailValue}>{facultyData.department}</Text>
                )}
              </View>
              </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={handleCancel}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.editButton]} 
                onPress={handleEdit}
              >
                <MaterialIcons name="edit" size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>25+</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 50,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    padding: 15,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  designation: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#6a11cb',
    paddingVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  button: {
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    width: '30%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default FacultyProfile;