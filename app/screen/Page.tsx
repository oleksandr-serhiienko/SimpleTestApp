import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function PageScreen() {
  const [fileName, setFileName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const readFile = async () => {
      try {
        const fileUri = FileSystem.documentDirectory + 'The Dune.txt';
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        setContent(fileContent);

        const fullName = fileUri.split('/').pop() || 'Unknown';
        const nameWithoutExtension = fullName.split('.').slice(0, -1).join('.');
        setFileName(nameWithoutExtension);
      } catch (error) {
        console.error('Error reading file:', error);
        setContent('Error reading file');
        setFileName('Error');
      }
    };

    readFile();
  }, []);

  const cleanWord = (word: string) => word.replace(/^[^\w]+|[^\w]+$/g, '');

  const handleWordPress = (word: string, index: number) => {
    const cleanedWord = cleanWord(word);
    setSelectedWord(cleanedWord);
    setSelectedIndex(index);
  };

  const renderContent = () => {
    if (!content) return null;

    return content.split(/(\s+|[.,!?:;]+)/).map((segment, index) => {
      // Check if the segment is whitespace or punctuation
      if (/(\s+|[.,!?:;]+)/.test(segment)) {
        return <Text key={index}>{segment}</Text>; // Preserve and render whitespace and punctuation
      }

      const cleanedSegment = cleanWord(segment);

      return (
        <TouchableWithoutFeedback key={index} onPress={() => handleWordPress(segment, index)}>
          <Text
            style={[
              styles.word,
              selectedWord === cleanedSegment && selectedIndex === index && styles.selectedWord,
            ]}
          >
            {segment}
          </Text>
        </TouchableWithoutFeedback>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fileName}</Text>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.content}>{renderContent()}</Text>
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
  content: {
    fontSize: 16,
    lineHeight: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 16,
    lineHeight: 24,
  },
  selectedWord: {
    backgroundColor: 'yellow',
  },
});
