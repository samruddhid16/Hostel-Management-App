import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ChooseRoleScreen = ({ navigation }) => {
  const roles = [
    {
      title: 'Student',
      icon: <FontAwesome5 name="user-graduate" size={32} color="#fff" />,
      onPress: () => navigation.navigate('StudentAuth'),
      color: '#8E54E9'
    },
    {
      title: 'Faculty',
      icon: <MaterialCommunityIcons name="account-tie" size={32} color="#fff" />,
      onPress: () => navigation.navigate('FacultyAuth'),
      color: '#4776E6'
    },
    {
      title: 'Warden',
      icon: <MaterialIcons name="security" size={32} color="#fff" />,
      onPress: () => navigation.navigate('WardenAuth'),
      color: '#3A5BC7'
    }
  ];

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        
        <Text style={styles.title}>Please select your role</Text>
        
        <View style={styles.rolesContainer}>
          {roles.map((role, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.roleButton, { backgroundColor: role.color }]}
              onPress={role.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                {role.icon}
              </View>
              <Text style={styles.roleText}>{role.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  rolesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  roleButton: {
    width: width * 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default ChooseRoleScreen;