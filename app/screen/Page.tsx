import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Reverso from '../services/reverso/reverso';
import SlidePanel from '../../components/SlidePanel';

interface SelectedRange {
  start: number | null;
  end: number | null;
}

export default function PageScreen() {
  const [fileName, setFileName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectedRange>({ start: null, end: null });
  const [translations, setTranslations] = useState<{[key: number]: {text: string, visible: boolean}}>({});
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [panelContent, setPanelContent] = useState<string>('');
  const [panelFullContent, setPanelFullContent] = useState<string>('');
  const reverso = new Reverso();
  const regex = /(\s+|[.,!?:;]|\n)/;
  const regexEndOfSentence = /[.!?\n]/;

  useEffect(() => {
    const readFile = async () => {
      try {
        const fileUri = FileSystem.documentDirectory + 'The Dune.txt';
        let fileContent = await FileSystem.readAsStringAsync(fileUri);       
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

  const toggleTranslationVisibility = (index: number) => {
    setTranslations(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        visible: !prev[index].visible
      }
    }));
  };

  const handleWordPress = async (word: string, index: number) => {
    // Reset states for new word
    setSelectedRange({ start: null, end: null });
    setSelectedWord(word);
    setSelectedIndex(index);
    setIsPanelVisible(false); // Hide panel before fetching new translations
    setPanelContent('');
    setPanelFullContent('');
  
    try {
      const translations = await reverso.getContextFromWebPage(word);
      console.log(translations);
      // Format each translation
      const formattedTranslations = translations.map(t => 
        `${t.word}${t.pos ? ` • ${t.pos}` : ''}`
      );
  
      // Prepare content for the panel
      const initialContent = formattedTranslations.slice(0, 5).join('\n');
      const fullContent = formattedTranslations.join('\n');
  
      setPanelContent(initialContent);
      setPanelFullContent(fullContent);
      setIsPanelVisible(true);
  
    } catch (error) {
      console.error('Error fetching translation:', error);
      setPanelContent(`Error fetching translation for "${word}"`);
      setPanelFullContent(`Error fetching translation for "${word}"`);
      setIsPanelVisible(true);
    }
  };

  const handleSentencePress = async (wordIndex: number) => {
    const parts = content.split(regex);
    let currentIndex = 0;
    let sentenceStart = 0;
    let sentenceEnd = content.length;
  
    for (let i = 0; i < parts.length; i++) {
      currentIndex += 1;

      if (currentIndex > wordIndex) {
        if (regexEndOfSentence.test(parts[i])) {
          sentenceEnd = currentIndex;
          break;
        }
      }
  
      if (regexEndOfSentence.test(parts[i])) {
        sentenceStart = currentIndex;
      }
    }

    while (parts[sentenceStart] === '' || regex.test(parts[sentenceStart])) {
      sentenceStart += 1;
    }

    while (parts[sentenceEnd - 1].match(/[\n ]/)) {
      sentenceEnd -= 1;
    }

    setSelectedRange({ start: sentenceStart, end: sentenceEnd - 1 });
    
    try {
        const translation = await reverso.getTranslationFromThePage(parts.slice(sentenceStart, sentenceEnd).join(''));
        const translationObj = JSON.parse(translation);
        const translatedText = translationObj["translation"];
        //console.log(translatedText);
        setTranslations(prev => ({
          ...prev, 
          [sentenceEnd]: {text: translatedText, visible: true}
        }));
    } catch (error) {
        console.error('Error fetching translation:', error);
    }
    
    setSelectedWord(null);
};


  const renderContent = () => {
    if (!content) return null;
  
    const parts = content.split(regex);
    
    return parts.map((segment, index) => {

      const isSelected = selectedRange.start !== null && 
                         selectedRange.end !== null && 
                         index >= selectedRange.start && 
                         index <= selectedRange.end;

      const hasPunctuation = regex.test(segment);
  
      const element = (
        <TouchableWithoutFeedback
          key={`segment-${index}`}
          onPress={() => handleWordPress(segment, index)}
          onLongPress={() => handleSentencePress(index)}
        >
          <Text
            style={[
              styles.word,
              selectedWord === segment && selectedIndex === index && !hasPunctuation && styles.selectedWord,                  
            ]}
          >
            {segment}
          </Text>
        </TouchableWithoutFeedback>
      );
  
      // If there's a translation for this index, add it after the segment
      if (translations[index] && translations[index].visible) {
        return [
          element,
          <TouchableWithoutFeedback
            key={`translation-touch-${index}`}
            onLongPress={() => toggleTranslationVisibility(index)}
          >
            <Text key={`translation-${index}`} style={styles.translation}>
              {translations[index].text}
            </Text>
          </TouchableWithoutFeedback>
        ];
      }
  
      return element;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fileName}</Text>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.content}>{renderContent()}</Text>
      </ScrollView>
      <SlidePanel 
        isVisible={isPanelVisible}
        initialContent={panelContent}
        fullContent={panelFullContent}
        onClose={() => setIsPanelVisible(false)}
      />
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
  translation: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'green',
    marginBottom: 10,
  },
});
