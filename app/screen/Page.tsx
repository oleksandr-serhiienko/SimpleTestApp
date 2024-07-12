import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function PageScreen() {
  const [fileName, setFileName] = useState<string>('');
  const [words, setWords] = useState<string[]>([]);
  const [highlightedWords, setHighlightedWords] = useState<Set<number>>(new Set());
  const [highlightedSentence, setHighlightedSentence] = useState<number | null>(null);

  useEffect(() => {
    const readFile = async () => {
      try {
        const fileUri = FileSystem.documentDirectory + 'The Dune.txt';
        const content = await FileSystem.readAsStringAsync(fileUri);
        
        // Split content into words
        setWords(content.split(/\s+/));
        
        // Extract the file name from the URI and remove the extension
        const fullName = fileUri.split('/').pop() || 'Unknown';
        const nameWithoutExtension = fullName.split('.').slice(0, -1).join('.');
        setFileName(nameWithoutExtension);
      } catch (error) {
        console.error('Error reading file:', error);
        setWords(['Error reading file']);
        setFileName('Error');
      }
    };

    readFile();
  }, []);

  const handleWordPress = (index: number) => {
    setHighlightedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleWordDoubleTap = (index: number) => {
    // Find the start and end of the sentence
    let start = index;
    while (start > 0 && !words[start - 1].match(/[.!?]$/)) {
      start--;
    }
    let end = index;
    while (end < words.length - 1 && !words[end].match(/[.!?]$/)) {
      end++;
    }

    setHighlightedSentence(highlightedSentence === start ? null : start);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fileName}</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.textContainer}>
          {words.map((word, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleWordPress(index)}
              onLongPress={() => handleWordDoubleTap(index)}
              delayLongPress={200}
            >
              <Text
                style={[
                  styles.word,
                  highlightedWords.has(index) && styles.highlightedWord,
                  highlightedSentence !== null &&
                    index >= highlightedSentence &&
                    !words.slice(highlightedSentence, index).some(w => w.match(/[.!?]$/)) &&
                    styles.highlightedSentence,
                ]}
              >
                {word}{' '}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 16,
  },
  highlightedWord: {
    backgroundColor: 'yellow',
  },
  highlightedSentence: {
    backgroundColor: 'lightblue',
  },
});