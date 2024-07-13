//index.tsx
import * as React from 'react';
import { useEffect } from 'react';
import Layout from './layout';
import * as FileSystem from 'expo-file-system';

const createTestFile = async () => {
  const fileUri = FileSystem.documentDirectory + 'The Dune.txt';
  const content = `Erstes Buch\n
  DER WÜSTENPLANET\n
  1\n
  Die größte Sorgfalt zu Beginn eines jeden Unternehmens sollte man auf die gleichmäßige Verteilung der Kräfte legen. Dies ist einer jeden Schwester der Bene Gesserit bekannt. Achte deshalb zu Beginn Deines Studiums über das Leben des Muad'dib darauf, in welcher Zeit er lebte: Er wurde im 57.\n
  Herrschaftsjahr des Padischah-Imperators Shaddam IV. geboren. Aber Dein Hauptaugenmerk solltest Du der Umgebung entgegenbringen, in der er lebte: der des Planeten Arrakis. Daß Muad'dib auf Caladan geboren wurde und dort die ersten fünfzehn Lebensjahre verbrachte, sollte zu keiner Selbsttäuschung führen. Arrakis, die Welt, die unter der Bezeichnung ›Wüstenplanet‹ bekannt ist, wurde seine ewige Heimat.\n
  AUS ›LEITFÄDEN DES MUAD'DIB‹, VON PRINZESSIN IRULAN\n
  test\n`;
  try {
    await FileSystem.writeAsStringAsync(fileUri, content);
    console.log('Test file created successfully');
  } catch (error) {
    console.error('Error creating test file:', error);
  }
};

export default function Index() {
  useEffect(() => {
    createTestFile();
  }, []);

  return <Layout />;
}