import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as firebase from 'firebase';
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRLV4X3930ux9V6wHi_RjOn7uX9dA4fnQ",
  authDomain: "mojii-285301.firebaseapp.com",
  databaseURL: "https://mojii-285301.firebaseio.com",
  projectId: "mojii-285301",
  storageBucket: "mojii-285301.appspot.com",
  messagingSenderId: "722958223243",
  appId: "1:722958223243:web:d33e24c2410677970cd18e",
  measurementId: "G-CM2Y5MS97W",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // registerForPushNotificationsAsync().then((token) => {
    //   setExpoPushToken(token);
    //   console.log(token);
    // });
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  useEffect(() => {
    db.collection("docs").doc("demo1").onSnapshot({
      includeMetadataChanges: true
    }, (doc) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setResult(doc.data().text);
      }, 2000);
    });
  }, [setResult]);

  return (
    <View style={styles.container}>
      {loading
        ? <ActivityIndicator size="large" animating = {loading} />
        : <Text style={{ fontSize: 50 }}>{result}</Text>
      }
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
