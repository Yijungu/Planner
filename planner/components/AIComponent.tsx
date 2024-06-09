import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Voice from 'react-native-voice';
import api from '../utils/api';

const AIComponent = () => {
  const [log, setLog] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
      }
    };
    requestPermission();

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = event => {
    setResults(event.value);
    console.log(event.value);
  };

  const onSpeechEnd = async () => {
    setIsRecording(false);
    console.log(results.length);
    if (results.length > 0) {
      const text = results[0];
      console.log('text', text);
      setLog(prevLog => [...prevLog, `User: ${text}`]);

      try {
        const response = await api.post('/ai/command', {command: text});
        if (response.status === 200) {
          const data = response.data;
          console.log('response.data', response.data);
          if (data.additionalResponse) {
            console.log('data.agentCommand : ', data.agentCommand);
            const additionalResponse = await api.post(
              '/ai/additional-command',
              {
                command: data.agentCommand,
              },
            );
            if (additionalResponse.status === 200) {
              const additionalData = additionalResponse.data;
              playAudioFromBase64(additionalData.audioBase64);
            } else {
              console.error('Failed to get additional response');
            }
          } else {
            playAudioFromBase64(data.audioBase64);
          }
        }
      } catch (error) {
        console.log('Error', [`Error: ${error.message}`]);
      }
    }
  };

  const onSpeechError = error => {
    setLog(prevLog => [...prevLog, `Error: ${error.error.message}`]);
    setIsRecording(false);
  };

  const playAudioFromBase64 = base64 => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], {type: 'audio/mpeg'});
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  const startRecording = () => {
    setIsRecording(true);
    setResults([]);
    Voice.start('ko-KR').catch(error => {
      setLog(prevLog => [...prevLog, `Error: ${error.message}`]);
      setIsRecording(false);
    });
  };

  const stopRecording = () => {
    Voice.stop().catch(error => {
      setLog(prevLog => [...prevLog, `Error: ${error.message}`]);
      setIsRecording(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Response Handler</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
          onPress={isRecording ? stopRecording : startRecording}
        />
      </View>
      <ScrollView style={styles.logContainer}>
        {log.map((entry, index) => (
          <Text key={index} style={styles.logEntry}>
            {entry}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logContainer: {
    flex: 1,
  },
  logEntry: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default AIComponent;
