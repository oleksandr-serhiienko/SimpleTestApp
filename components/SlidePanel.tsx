import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, ScrollView } from 'react-native';

interface SlidePanelProps {
  isVisible: boolean;
  initialContent: string;
  fullContent: string;
  onClose: () => void;
  style?: object;
}

const SlidePanel: React.FC<SlidePanelProps> = ({
    isVisible,
    initialContent,
    fullContent,
    onClose,
    style
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const panY = useRef(new Animated.Value(0)).current;
    const translateY = panY.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 0, 1],
    });
  
    const resetPositionAnim = Animated.timing(panY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });
  
    const handleClose = () => {
      setIsExpanded(false);
      panY.setValue(0);
      onClose();
    };
  
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderGrant: () => {
          panY.setValue(0);
        },
        onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy < -50) {
            setIsExpanded(true);
          } else if (gestureState.dy > 50 && !isExpanded) {
            handleClose();
          } else {
            resetPositionAnim.start();
          }
        },
      })
    ).current;
  
    if (!isVisible) return null;
  
    return (
      <Animated.View
        style={[
          styles.container,
          style,
          { transform: [{ translateY }] },
          isExpanded && styles.expandedContainer,
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        <ScrollView>
          <Text>{isExpanded ? fullContent : initialContent}</Text>
          {!isExpanded && fullContent !== initialContent && (
            <Text style={styles.pullUpText}>Pull up to see more</Text>
          )}
        </ScrollView>
      </Animated.View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '50%',
  },
  expandedContainer: {
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: 'gray',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  pullUpText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 10,
  },
});

export default SlidePanel;