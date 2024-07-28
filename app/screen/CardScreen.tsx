import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Database } from '@/db/database';

const renderHighlightedText = (text:string) => {
  const parts = text.split(/(<em>.*?<\/em>)/);
  return parts.map((part, index) => {
    if (part.startsWith('<em>') && part.endsWith('</em>')) {
      return (
        <Text key={index} style={styles.highlightedText}>
          {part.slice(4, -5)} {/* Remove <em> and </em> tags */}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

export default function CardScreen() {
  const [database] = useState(() => new Database());
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | undefined>();

  useEffect(() => {
    const initialize = async () => {
      await database.initialize();
      await getAllCards();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (allCards.length > 0 && !currentCard) {
      setCurrentCard(allCards[0]);
    }
  }, [allCards, currentCard]);

  const getAllCards = async () => {
    const cards = await database.getAllCards();
    setAllCards(cards);
  };

  const setCardToReview = async () => {
    if (currentCard) {
      const updatedCard = { ...currentCard, lastRepeat: new Date() };
      await database.updateCard(updatedCard);

      setAllCards(prevCards => {
        const newCards = prevCards.filter(card => card.id !== currentCard.id);
        newCards.push(updatedCard);
        return newCards;
      });

      const nextCard = allCards.length > 1 ? allCards[1] : undefined;
      setCurrentCard(nextCard);
      console.log(nextCard);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{currentCard?.word || 'No cards available'}</Text>
      <Text style={styles.text1}>{currentCard?.translations[0] || 'No translation available'}</Text>
      {currentCard?.context && currentCard.context.length > 0 ? (
        <>
          
          <Text style={styles.text2}>
            {renderHighlightedText(currentCard.context[0].sentence || 'No context sentence available')}
          </Text>
          <Text style={styles.text2}>
            {renderHighlightedText(currentCard.context[0].translation || 'No context translation available')}
          </Text>
        </>
      ) : (
        <Text style={styles.text1}>No context available</Text>
      )}
      <TouchableOpacity style={styles.addButton} onPress={setCardToReview}>
        <Text style={styles.addButtonText}>Next Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'bold'
  },
  text1: {
    fontSize: 18,
    fontStyle: 'italic'
  },
  text2: {
    fontSize: 14,
    fontStyle: 'normal'
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },

  highlightedText: {
    fontWeight: 'bold',
    fontStyle: 'normal',
  },

  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});