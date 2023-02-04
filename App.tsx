import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { CameraCapturedPicture } from 'expo-camera/build/Camera.types';

export default function App() {
  let cameraRef = useRef<Camera>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | undefined>();
  const [photo, setPhoto] = useState<CameraCapturedPicture | undefined>();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>
  }

  let takePic = async () => {
    
    if(cameraRef.current){
      let options = {
        quality: 1,
        base64: true,
        exif: false
      };
  
      let newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
    }
   
  };

  if (photo) {
    let sharePic = () => {
      shareAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.container} ref={cameraRef}>
    <View style={styles.buttonContainer}>
      <Button title="Take Pic" onPress={takePic} />
    </View>
    <StatusBar style="auto" />
  </Camera>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end'
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  }
});
