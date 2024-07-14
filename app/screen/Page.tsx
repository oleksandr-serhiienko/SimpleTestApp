import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface SelectedRange {
  start: number | null;
  end: number | null;
}

export default function PageScreen() {
  const [fileName, setFileName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectedRange>({ start: null, end: null });

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

  const handleSentencePress = (wordIndex: number) => {
    const regex = /(\s+|[.,!?:;\n]+)/;
    const sentenceDelimiterRegex = /[.!?\n]/;
    const parts = content.split(regex);
    let currentIndex = 0;
    let sentenceStart = 0;
    let sentenceEnd = content.length;
  
    for (let i = 0; i < parts.length; i++) {
      currentIndex += 1;
  
      if (currentIndex > wordIndex) {
        if (sentenceDelimiterRegex.test(parts[i])) {
          sentenceEnd = currentIndex;
          break;
        }
      }
  
      if (sentenceDelimiterRegex.test(parts[i])) {
        sentenceStart = currentIndex;
      }
    }
  
    console.log('wordIndex:', wordIndex);
    console.log('sentenceStart:', sentenceStart);
    console.log('sentenceEnd:', sentenceEnd);

    console.log('wordIndex:', parts[wordIndex]);
    console.log('sentenceStart:', parts[sentenceStart]);
    console.log('sentenceEnd:', parts[sentenceEnd]);
    console.log(parts.slice(sentenceStart, sentenceEnd))
    console.log(content.slice(sentenceStart, sentenceEnd))

    const selectedSentence = content.slice(sentenceStart, sentenceEnd).trim();
    setSelectedSentence(selectedSentence);
    setSelectedWord(null); 
    // Clear word selection when a sentence is selected
    setSelectedRange({ start: sentenceStart, end: sentenceEnd });

    
  };

  const renderContent = () => {
    if (!content) return null;

    const regex = /(\s+|[.,!?:;\n]+)/;
    
    return content.split(regex).map((segment, index) => {
      // Check if the segment is whitespace or punctuation
      if (regex.test(segment)) {
        return <Text key={index}>{segment}</Text>; // Preserve and render whitespace and punctuation
      }

      const cleanedSegment = cleanWord(segment);

      return (
        <TouchableWithoutFeedback
          key={index}
          onPress={() => handleWordPress(segment, index)}
          onLongPress={() => handleSentencePress(index)}
        >
          <Text
            style={[
              styles.word,
              selectedWord === cleanedSegment && selectedIndex === index && styles.selectedWord,              
              selectedRange.start !== null && selectedRange.end !== null && index >= selectedRange.start && index <= selectedRange.end && styles.selectedSentence,
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
  selectedSentence: {
    backgroundColor: 'lightblue',
  },
});
