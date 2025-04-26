import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // Generate animated bubbles with more properties
  const bubbles = Array.from({ length: 15 }).map((_, i) => {
    const size = Math.random() * 60 + 40;
    const left = Math.random() * (width - size);
    const top = Math.random() * (height - size);
    const opacity = Math.random() * 0.2 + 0.1;
    const duration = Math.random() * 10000 + 5000; // 5-15 seconds
    const delay = Math.random() * 5000;
    const yMovement = Math.random() * 100 + 50; // 50-150px vertical movement
    
    return {
      id: i,
      size,
      left,
      top,
      opacity,
      duration,
      delay,
      yMovement,
      scale: Math.random() * 0.5 + 0.5, // 0.5-1.0 scale variation
    };
  });

  // Create animated values for each bubble
  const animatedValues = bubbles.map(bubble => ({
    yAnim: useRef(new Animated.Value(0)).current,
    scaleAnim: useRef(new Animated.Value(bubble.scale)).current,
    xAnim: useRef(new Animated.Value(0)).current,
  }));

  // Start animations
  useEffect(() => {
    const animations = bubbles.map((bubble, index) => {
      const { yAnim, scaleAnim, xAnim } = animatedValues[index];
      
      // Create parallel animations for floating and pulsing
      return Animated.parallel([
        // Floating up and down
        Animated.loop(
          Animated.sequence([
            Animated.timing(yAnim, {
              toValue: -bubble.yMovement,
              duration: bubble.duration,
              delay: bubble.delay,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(yAnim, {
              toValue: 0,
              duration: bubble.duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
        
        // Gentle pulsing
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: bubble.scale * 1.2,
              duration: bubble.duration * 1.5,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: bubble.scale,
              duration: bubble.duration * 1.5,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
        
        // Slight horizontal drift
        Animated.loop(
          Animated.sequence([
            Animated.timing(xAnim, {
              toValue: Math.random() * 20 - 10, // -10 to 10px movement
              duration: bubble.duration * 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(xAnim, {
              toValue: 0,
              duration: bubble.duration * 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      ]);
    });

    // Start all animations
    animations.forEach(animation => animation.start());

    // Clean up animations on unmount
    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
    >
      {/* Animated Bubbles */}
      {bubbles.map((bubble, index) => {
        const { yAnim, scaleAnim, xAnim } = animatedValues[index];
        
        return (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                width: bubble.size,
                height: bubble.size,
                left: bubble.left,
                top: bubble.top,
                opacity: bubble.opacity,
                borderRadius: bubble.size / 2,
                transform: [
                  { translateY: yAnim },
                  { scale: scaleAnim },
                  { translateX: xAnim },
                ],
              },
            ]}
          />
        );
      })}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>🏠 Stay Connect 🏠</Text>
        <Text style={styles.subtitle}>Your Complete Hostel Solution</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ChooseRole')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1, // Ensure content stays above bubbles
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
});

export default HomeScreen;