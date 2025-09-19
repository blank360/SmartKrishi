import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Pressable,
  ActivityIndicator,
  Alert,
  PanResponder,
  Dimensions,
  StatusBar
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as Font from "expo-font";
import { FIREBASE_DB, FIREBASE_DB_REALTIME, FIREBASE_APP } from "../firebaseConfig.js";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Mainback from "../assets/Mainback.js";
import { Icon, Menu, PaperProvider, Provider } from "react-native-paper";
import { Database, get, getDatabase, off, onValue, ref, set, query, update } from "firebase/database";
import { useFocusEffect } from "@react-navigation/native";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import App from "./ui1.js";


export default function HomeScreen({ navigation }) {
  const app = getApp();
  const authy = getAuth(app);

  let fonts = {
    "HomeStyle": require("../fonts/HomeStyle.ttf"),
    "Merienda-Medium": require("../fonts/Merienda-Medium.ttf"),
    "Lalezar": require("../fonts/Lalezar-Regular.ttf"),
    "NovaSquare": require("../fonts/NovaSquare-Regular.ttf"),
     "Gliker" : require("../fonts/Gliker.ttf")
  };

  const [screen_put, set_screen_put] = useState('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  
  let [fontloaded] = Font.useFonts(fonts);

  if (!fontloaded) {
    return <View><ActivityIndicator size="large" color="#0000ff" /></View>;
  } else {
    return (
      <Provider>
        <App/>
      </Provider>
    );
  }
}