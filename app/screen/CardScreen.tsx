import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { Card, Database } from '@/db/database';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

const renderHighlightedText = (text: string) => {
  const parts = text.split(/(<em>.*?<\/em>)/);
  return parts.map((part, index) => {
    if (part.startsWith('<em>') && part.endsWith('</em>')) {
      return (
        <Text key={index} style={styles.highlightedText}>
          {part.slice(4, -5)}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

export default function CardScreen() {
  const [database] = useState(() => new Database());
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    const initialize = async () => {
      await database.initialize();
      await getAllCards();
    };
    initialize();
  }, []);

  const getAllCards = async () => {
    const cards = await database.getAllCards();
    setAllCards(cards);
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const item = allCards[currentCardIndex];
    direction === 'right' ? console.log('Swiped right') : console.log('Swiped left');
    setCurrentCardIndex(prevIndex => prevIndex + 1);
    position.setValue({ x: 0, y: 0 });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: 0 });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  });

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const renderCard = () => {
    const currentCard = allCards[currentCardIndex];

    if (!currentCard) {
      return (
        <View style={styles.container}>
          <Text>No more cards</Text>
        </View>
      );
    }

    return (
      <View style={styles.cardContent}>
        <Text style={styles.word}>{currentCard.word}</Text>
        <Text style={styles.translation}>{currentCard.translations[0]}</Text>
        
        <View style={styles.separator} />
        
        {currentCard.context && currentCard.context.length > 0 && (
          <View style={styles.contextContainer}>
            <Text style={styles.contextText}>
              {renderHighlightedText(currentCard.context[0].sentence)}
            </Text>
            <Text style={styles.contextText}>
              {renderHighlightedText(currentCard.context[0].translation)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.cardContainer, getCardStyle()]} 
        {...panResponder.panHandlers}
      >
        {renderCard()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  cardContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  translation: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  contextContainer: {
    width: '100%',
  },
  contextText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'left',
  },
  highlightedText: {
    fontWeight: 'bold',
  },
});