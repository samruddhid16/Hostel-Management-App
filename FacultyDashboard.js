import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const FacultyDashboard = ({ navigation }) => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');

  useEffect(() => {
    const q = query(
      collection(db, 'leaveApplications'),
      where('status', '==', selectedTab)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const applications = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          // Format the leave period as "startDate - endDate"
          leavePeriod: `${data.startDate} - ${data.endDate}`
        });
      });
      setLeaveApplications(applications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedTab]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await updateDoc(doc(db, 'leaveApplications', applicationId), {
        status,
        processedAt: new Date().toISOString(),
        processedBy: auth.currentUser.uid
      });
      Alert.alert('Success', `Application ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FacultyProfile')}>
          <FontAwesome5 name="user-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={styles.tabText}>Pending</Text>
          {selectedTab === 'pending' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'approved' && styles.activeTab]}
          onPress={() => setSelectedTab('approved')}
        >
          <Text style={styles.tabText}>Approved</Text>
          {selectedTab === 'approved' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'rejected' && styles.activeTab]}
          onPress={() => setSelectedTab('rejected')}
        >
          <Text style={styles.tabText}>Rejected</Text>
          {selectedTab === 'rejected' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {leaveApplications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={50} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>No {selectedTab} applications</Text>
            </View>
          ) : (
            leaveApplications.map((application) => (
              <View key={application.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.studentName}>{application.studentName}</Text>
                    <Text style={styles.rollNumber}>Roll No: {application.rollNumber}</Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Text style={styles.leavePeriod}>{application.leavePeriod}</Text>
                    <Text style={styles.department}>{application.department}</Text>
                  </View>
                </View>
                
                <Text style={styles.reason}>{application.reason}</Text>
                
                {selectedTab === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleStatusUpdate(application.id, 'approved')}
                    >
                      <MaterialIcons name="check" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleStatusUpdate(application.id, 'rejected')}
                    >
                      <MaterialIcons name="close" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {application.status !== 'pending' && (
                  <View style={styles.statusContainer}>
                    <Text style={[
                      styles.statusText,
                      application.status === 'approved' ? styles.approvedStatus : styles.rejectedStatus
                    ]}>
                      {application.status.toUpperCase()}
                    </Text>
                    <Text style={styles.processedText}>
                      Processed by: {application.processedBy?.substring(0, 6)}...
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 5,
  },
  tab: {
    padding: 10,
    alignItems: 'center',
    flex: 1,
  },
  activeTab: {
    position: 'relative',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -5,
    height: 3,
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 15,
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  studentName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rollNumber: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  leavePeriod: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  department: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  reason: {
    color: '#fff',
    marginBottom: 15,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.7)',
  },
  rejectButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  statusText: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: 'bold',
    fontSize: 12,
  },
  approvedStatus: {
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
    color: '#2ecc71',
  },
  rejectedStatus: {
    backgroundColor: 'rgba(231, 76, 60, 0.3)',
    color: '#e74c3c',
  },
  processedText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 4,
  },
});

export default FacultyDashboard;