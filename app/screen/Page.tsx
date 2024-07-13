import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function PageScreen() {
  const [fileName, setFileName] = useState<string>('');
  const [words, setWords] = useState<{ text: string; word: string; isWord: boolean }[]>([]);
  const [highlightedWords, setHighlightedWords] = useState<number | null>(null);
  const [highlightedSentence, setHighlightedSentence] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const readFile = async () => {
      try {
        const fileUri = FileSystem.documentDirectory + 'The Dune.txt';
        const content = await FileSystem.readAsStringAsync(fileUri);

        // Split content into words and spaces
        const wordsAndSpaces = content.split(/(\s+)/).map(item => {
          if (/^\s*$/.test(item)) {
            return { text: item, word: item, isWord: false };
          } else {
            const match = item.match(/^([\w'-]+)([\s.,:;!?]*)$/);
            return {
              text: item,
              word: match ? match[1] : item,
              isWord: true
            };
          }
        });

        setWords(wordsAndSpaces);

        // Extract the file name from the URI and remove the extension
        const fullName = fileUri.split('/').pop() || 'Unknown';
        const nameWithoutExtension = fullName.split('.').slice(0, -1).join('.');
        setFileName(nameWithoutExtension);
      } catch (error) {
        console.error('Error reading file:', error);
        setWords([{ text: 'Error reading file', word: 'Error reading file', isWord: true }]);
        setFileName('Error');
      }
    };

    readFile();
  }, []);

  const handleWordPress = (index: number) => {
    setHighlightedWords(index);
    setHighlightedSentence(null);
  };

  const handleWordDoubleTap = (index: number) => {
    // Find the start and end of the sentence
    let start = index;
    while (start > 0 && !words[start - 1].text.match(/[.!?]$/)) {
      start--;
    }
    // Trim leading whitespace
    while (start < words.length && !words[start].isWord) {
      start++;
    }

    let end = index;
    while (end < words.length - 1 && !words[end].text.match(/[.!?]$/)) {
      end++;
    }
    // Include the ending punctuation
    if (end < words.length && words[end].text.match(/[.!?]$/)) {
      end++;
    }
    // Trim trailing whitespace
    while (end > start && !words[end - 1].isWord && !words[end - 1].text.match(/[.!?]$/)) {
      end--;
    }

    setHighlightedSentence(highlightedSentence && highlightedSentence.start === start ? null : { start, end });
    setHighlightedWords(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fileName}</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.textContainer}>
          {words.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => item.isWord && handleWordPress(index)}
              onLongPress={() => item.isWord && handleWordDoubleTap(index)}
              delayLongPress={200}
            >
              <Text
                style={[
                  styles.word,
                  highlightedSentence !== null &&
                    index >= highlightedSentence.start &&
                    index < highlightedSentence.end &&
                    styles.highlightedSentence,
                ]}
              >
                {item.isWord ? (
                  <>
                    <Text style={highlightedWords === index ? styles.highlightedWord : null}>
                      {item.word}
                    </Text>
                    <Text>{item.text.slice(item.word.length)}</Text>
                  </>
                ) : (
                  item.text
                )}
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