import React, { useState, useEffect, useRef, useCallback } from 'react';
import {StyleSheet,Text,View,StatusBar,TouchableOpacity,ScrollView,TextInput,Image,FlatList,KeyboardAvoidingView,Platform, Alert,} from 'react-native';
import { GoogleGenAI } from "@google/genai";
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { CONFIG, FIREBASE_Auth, FIREBASE_DB } from '../firebaseConfig';
import { ActivityIndicator, Button, FAB, Modal, ProgressBar, Provider } from 'react-native-paper';
import * as Location from "expo-location";
import { set } from 'firebase/database';

// --- Mock Data ---
const MOCK_PRODUCTS = [
  { id: '1', name: 'High-Yield Paddy Seeds', price: '₹250', unit: '/kg', image: 'https://placehold.co/400x300/a7f3d0/14532d?text=Paddy+Seeds' },
  { id: '2', name: 'Urea Fertilizer (46% N)', price: '₹300', unit: '/bag', image: 'https://placehold.co/400x300/fecaca/991b1b?text=Urea+Fertilizer' },
  { id: '3', name: 'Mini Power Tiller', price: '₹45,000', unit: '', image: 'https://placehold.co/400x300/bfdbfe/1e3a8a?text=Power+Tiller' },
  { id: '4', name: 'Organic Neem Oil', price: '₹400', unit: '/litre', image: 'https://placehold.co/400x300/fef08a/854d0e?text=Neem+Oil' },
  { id: '5', name: 'Knapsack Sprayer', price: '₹1,200', unit: '', image: 'https://placehold.co/400x300/d1d5db/1f2937?text=Sprayer' },
  { id: '6', name: 'Hybrid Tomato Seeds', price: '₹150', unit: '/pack', image: 'https://placehold.co/400x300/fbcfe8/831843?text=Veggie+Seeds' },
];

// --- Reusable Components ---

const Header = ({ onNavigate }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.logoContainer} onPress={() => onNavigate('home')}>
        <Image source={require('../assets/logo.png')} style={{width:40,height:40}} />
        <Text style={styles.headerTitle}>SmartKrishi</Text>
      </TouchableOpacity>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.navButton}>
            <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('marketplace')} style={styles.navButton}>
            <Text>Market</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const AGRO_APPID = "fb01a7d48d692d4c631c64492f069de8"; // Replace with your real key
const BASE_URL = "https://api.agromonitoring.com/agro/1.0";
const FarmDashboard = ({id}) => {
  const [activeTab, setActiveTab] = useState("soil");
  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [advice,setadvice] = useState([]);
  const [soilData, setSoilData] = useState({
    dt:0,
    moisture:0,
    t0:0,
    t10:0
  });
  const [data, setData] = useState({ ph: 0, soc: 0, bdod: 0 });

  const fetchProfile = async () => {
    try {
      if (!id) return console.log("User not logged in");

      const docRef = doc(FIREBASE_DB, "Profile", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setProfile(snap.data());
      else console.log("No profile found.");
    } catch (error) {
      console.error("Error fetching profile document:", error);
      Alert.alert("Error", "Failed to load profile data.");
    }
  };

  const fetchWithTimeout = (url, timeout = 20000) =>
    Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
    ]);

  const fetchSoilProperties = useCallback(async () => {
    setData({
      ph: profile.soil.ph,
      soc: profile.soil.soc,
      bdod: profile.soil.bdod
    });
    /*
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Cannot fetch soil data without location");
        return;
      }

      setLoading(true);
      const loc = await Location.getCurrentPositionAsync({});
      const lon = loc.coords.longitude;
      const lat = loc.coords.latitude;

      console.log("Fetching soil data for:", lon, lat);

      const properties = ["soc", "phh2o", "bdod"];
      const updatedData = {};

      for (const prop of properties) {
        const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=${prop}&value=mean`;
        console.log("API URL:", url);

        const resp = await fetchWithTimeout(url);
        if (!resp.ok) throw new Error(`Failed fetching ${prop} data: ${resp.status}`);

        const json = await resp.json();
        if (!json?.properties?.layers?.length) continue;

        const depths = json.properties.layers[0].depths;
        const avgValue = depths.reduce((sum, d) => sum + (d.values?.mean ?? 0), 0) / depths.length;

        if (prop === "soc") updatedData.soc = Math.min((avgValue / 20) * 100, 100);
        if (prop === "phh2o") updatedData.ph = Math.min((avgValue / 14) * 100, 100);
        if (prop === "bdod") updatedData.bdod = Math.min((avgValue / 1.8) * 100, 100);
      }

      setData((prev) => ({ ...prev, ...updatedData }));
      console.log("✅ Soil Health Data:", updatedData);
    } catch (e) {
      console.error("Error fetching soil data:", e.message);
      Alert.alert("Error", e.message || "Failed to load soil data.");
    } finally {
      setLoading(false);
    }
      */
  }, []);

  // Fetch AgroMonitoring polygon-based data
  const fetchAgroMonitoringData = useCallback(async (polygonId) => {
    if (!polygonId) return;
    try {
      setLoading(true);
      const resp = await fetch(`${BASE_URL}/soil?polyid=${polygonId}&appid=${AGRO_APPID}`);
      if (!resp.ok) throw new Error("Failed fetching soil data from AgroMonitoring");
      const data = await resp.json();
      console.log(data);
      setSoilData(data);
    } catch (err) {
      console.error("Error fetching AgroMonitoring soil data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile().then(() => {
      fetchAgroMonitoringData(profile.polygon);
      analysis();
    });
    fetchSoilProperties();
  }, []);

  const analysis = async () => {
    try {
      const ai = new GoogleGenAI({apiKey:`AIzaSyAu7L83QcgKKbC19CJTDylDiii22jLZOmQ`}); // ✅ Pass your API key here
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an agriculture bot which will only provide three answer with space betweeen these three sentences so that i can split('.') them to array,one is a very small summary of this report which can be understandable to the local farmers , second sentence is the high demand fertilizer for the report and third sentence is the suitable crops for the report with an emoji if possible.Given the soil properties: pH Level: ${data.ph}, Soil Organic Carbon: ${data.soc}%, Bulk Density: ${data.bdod} g/cm³, and current soil moisture of ${(soilData.moisture * 100).toFixed(1)}% with surface temperature of ${(soilData.t0 - 273.15).toFixed(1)}°C,suggest suitable crops and fertilizer plans for optimal yield.`,
      });
      setadvice(response.text.split('.'));
    } catch (err) {
      console.error("AI Analysis Error:", err);
      Alert.alert("Error", "Failed to get analysis from AI.");
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "fertilizer":
        return (
          <View>
            <Text style={styles.contentTitle}>Personalized Fertilizer Plan</Text>
            <Text style={styles.listItem}>
              {" "}
              • <Text style={{ fontWeight: "bold" }}>Summary:</Text> {advice[0]}.{" "}
            </Text>
            <Text style={styles.listItem}>
              {" "}
              • <Text style={{ fontWeight: "bold" }}>Fertilizer:</Text> {advice[1]}{" "}
            </Text>
          </View>
        );
      case "crop":
        return (
          <View>
            <Text style={styles.contentTitle}>Recommended Crops</Text>
            <Text style={styles.listItem}>{advice[2]}</Text>
          </View>
        );
      case "soil":
      default:
        return (
          <View>
            <Text style={styles.contentTitle}>Soil Health Report</Text>
            <View style={styles.tabContent}>
          {activeTab === "soil" && (
            <>
              {/* pH Level */}
               <View style={{ marginBottom: 12 ,gap:6}}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.progressLabel}>pH Level</Text>
                    <Text style={styles.progressValue}>{data.ph ? data.ph.toFixed(1) : "N/A"}</Text>
                  </View>
                  <ProgressBar
                   style={{height:15,borderRadius:10}}
                    progress={getPhProgress(data.ph)}
                    color={getPhColor(data.ph)}
                  />
                </View>

                {/* Soil Organic Carbon */}
                <View style={{ marginBottom: 12 ,gap:6}}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.progressLabel}>Soil Organic Carbon</Text>
                    <Text style={styles.progressValue}>{data.soc ? data.soc.toFixed(1) : "N/A"}%</Text>
                  </View>
                  <ProgressBar
                    style={{height:15,borderRadius:10}}
                    progress={getSocProgress(data.soc)}
                    color={getSocColor(data.soc)}
                  />
                </View>

                {/* Bulk Density */}
               <View style={{ marginBottom: 12 ,gap:6}}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.progressLabel}>{"Bulk Density"}</Text>
                    <Text style={styles.progressValue}>{data.bdod ? data.bdod.toFixed(2) : "N/A"} g/cm³</Text>
                  </View>
                  <ProgressBar
                    style={{height:15,borderRadius:10}}
                    progress={getBdodProgress(data.bdod)}
                    color={getBdodColor(data.bdod)}
                  />
                </View>
              <View style={{ marginBottom: 12 ,gap:6}}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.progressLabel}>{"Soil Moisture"}</Text>
                  <Text style={styles.progressValue}>{(soilData.moisture * 100).toFixed(1)}%</Text>
                </View>
                <ProgressBar style={{height:15,borderRadius:10}} progress={(soilData.moisture * 100).toFixed(1) / 100} color={soilData.moisture > 0.7 ? "green" : soilData.moisture > 0.5 ? "orange" : "red"} />
              </View>
              <View style={{ marginBottom: 12 ,gap:6}}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.progressLabel}>{"Suraface Temperature"}</Text>
                  <Text style={styles.progressValue}>{(soilData.t0 - 273.15).toFixed(1)}°C</Text>
                </View>
                <ProgressBar style={{height:15,borderRadius:10}} progress={(soilData.t0 - 273.15).toFixed(1) / 100} color={((soilData.t0 - 273.15) < 30 && (soilData.t0 - 273.15) > 20 ) ? "green" : soilData.t0 >= 30 ? "red" : "orange"} />
              </View>
            </>
        )}
      </View>
          </View>
        );
    }
  };
  const getPhProgress = (ph) => {
  // Normalize pH from 0-14 to 0-100 for the progress bar
  return (ph / 14);
};

const getPhColor = (ph) => {
  if (ph >= 6.0 && ph <= 7.0) { // Ideal range for most crops 🌾
    return 'green';
  } else if ((ph > 5.0 && ph < 6.0) || (ph > 7.0 && ph < 8.0)) {
    return 'orange';
  } else {
    return 'red';
  }
};

// Soil Organic Carbon (percentage)
const getSocProgress = (soc) => {
  // Normalize SOC to a reasonable max, e.g., 5%
  return (soc / 5);
};

const getSocColor = (soc) => {
  if (soc >= 2.5) { // Excellent levels 🌿
    return 'green';
  } else if (soc >= 1.5 && soc < 2.5) {
    return 'orange';
  } else {
    return 'red';
  }
};

// Bulk Density (g/cm³)
const getBdodProgress = (bdod) => {
  // Normalize bulk density to a max value, e.g., 2.0 g/cm³, since lower is better
  return (1 - (bdod / 2.0));
};

const getBdodColor = (bdod) => {
  if (bdod <= 1.4) { // Low bulk density, good for root growth 🌱
    return 'green';
  } else if (bdod > 1.4 && bdod <= 1.6) {
    return 'orange';
  } else {
    return 'red';
  }
};

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text onPress={fetchSoilProperties} style={styles.cardTitle}>
          {profile ? profile.name.split(" ")[0] : "User"}'s Dashboard
        </Text>
        {loading && <ActivityIndicator size="small" color="#0000ff" />}
        <TouchableOpacity onPress={() => nav.navigate("CameraScreen")} style={{ padding: 2 }}>
          <Image source={require("../assets/Camera.png")} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["soil", "fertilizer", "crop"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
            }}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
     
        {
          renderTabContent()
        }
      
    </View>
  );
};

const OPENWEATHER_API_KEY = "d382399b60786d4f3c9467e4efa8685c";

const getFarmerSuggestion = (data) => {
  if (!data || !data.weather) return "No suggestion available.";

  const temp = data.main?.temp ? data.main.temp - 273.15 : null;
  const condition = data.weather[0]?.main || "";
  const wind = data.wind?.speed || 0;

  if (condition.includes("Rain")) {
    return "🌧️ Rain expected. Avoid irrigation and protect stored crops.";
  }
  if (condition.includes("Thunderstorm")) {
    return "⛈️ Thunderstorm likely. Avoid field work and ensure livestock are safe.";
  }
  if (condition.includes("Clear") && temp !== null && temp > 30) {
    return "☀️ Hot and sunny. Good day for harvesting but ensure proper hydration.";
  }
  if (condition.includes("Cloud")) {
    return "☁️ Cloudy day. Suitable for sowing or light irrigation.";
  }
  if (wind > 30) {
    return "💨 High winds expected. Avoid pesticide spraying today.";
  }
  if (temp !== null && temp < 15) {
    return "❄️ Cold weather. Consider protecting sensitive crops.";
  }

  return "✅ Weather is favorable for most farming activities today.A Seed Plating day !";
};


const WeatherCard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const loc = await Location.getCurrentPositionAsync({});
      const lon = loc.coords.longitude;
      const lat = loc.coords.latitude;

      // Fetch current weather
      const currentResp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
      );
      const currentData = await currentResp.json();
      setCurrentWeather(currentData);

      // Fetch hourly forecast (48 hours)
      const forecastResp = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
      );
      const forecastData = await forecastResp.json();
      setForecast(forecastData.list || []);
    } catch (e) {
      console.error("Error fetching weather data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading weather...</Text>
      </View>
    );
  }

  if (!currentWeather) return <Text>No weather data available</Text>;

  // Get data to display (current or selected hour)
  const displayData = selectedHour || {
    main: currentWeather.main,
    weather: currentWeather.weather,
    wind: currentWeather.wind,
    visibility: currentWeather.visibility,
  };

  return (
    <View style={[styles.card, { height: 470 }]}>
      {/* Header */}
      <View style={styles.weatherHeader}>
        <Text style={styles.cardTitle}>
          ☀️ {selectedHour ? "Selected Hour" : "Current Weather"}
        </Text>
        <View>
          <Text style={styles.weatherLocation}>{currentWeather.name}</Text>
          <Text style={styles.weatherUpdate}>Updated just now</Text>
        </View>
      </View>

      {/* Main weather */}
      <View style={styles.weatherMain}>
        <Text style={styles.weatherTemp}>
          {displayData.main?.temp
            ? `${Math.round(displayData.main.temp - 273.15)}°C`
            : "N/A"}
        </Text>
        <Text style={styles.weatherCondition}>
          {displayData.weather?.[0]?.description || "Unknown"}
        </Text>
      </View>

      {/* Weather details */}
      <View style={styles.weatherDetails}>
        <View style={styles.detailItem}>
          <Text>💧 Humidity</Text>
          <Text style={styles.detailValue}>
            {displayData.main?.humidity ?? "--"}%
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text>💨 Wind</Text>
          <Text style={styles.detailValue}>
            {displayData.wind?.speed ?? "--"} km/h
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text>🌡️ Pressure</Text>
          <Text style={styles.detailValue}>
            {displayData.main?.pressure ?? "--"} hPa
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text>👁️ Visibility</Text>
          <Text style={styles.detailValue}>
            {displayData.visibility
              ? (displayData.visibility / 1000).toFixed(1)
              : "--"}{" "}
            km
          </Text>
        </View>
      </View>

      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>👨‍🌾 Farmer Suggestion</Text>
        <Text style={styles.suggestionText}>
          {getFarmerSuggestion(displayData)}
        </Text>
      </View>


      {/* Hourly forecast selector */}
      <ScrollView
        style={styles.forecastContainer}
        horizontal
        contentContainerStyle={{ padding: 12, gap: 10, height: 90 }}
      >
        {forecast.slice(0, 12).map((hour, index) => {
          const date = new Date(hour.dt * 1000);
          const time = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          });

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.forecastItem,
                selectedHour?.dt === hour.dt && styles.forecastItemSelected,
              ]}
              onPress={() =>
                setSelectedHour(selectedHour?.dt === hour.dt ? null : hour)
              } // ✅ Toggle selection
            >
              <Text>{time}</Text>
              <Text style={styles.forecastIcon}>
                {hour.weather[0].main.includes("Rain")
                  ? "🌧️"
                  : hour.weather[0].main.includes("Cloud")
                  ? "☁️"
                  : "☀️"}
              </Text>
              <Text>{Math.round(hour.main.temp - 273.15)}°</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};


const AssistantCard = ({ onNavigate }) => (
    <TouchableOpacity style={styles.assistantCard} onPress={() => onNavigate('chatbot')}>
        <View>
            <Text style={styles.assistantTitle}>AI Krishi Assistant</Text>
            <Text style={styles.assistantSubtitle}>Get instant answers to your questions</Text>
        </View>
        <Text style={styles.assistantIcon}>›</Text>
    </TouchableOpacity>
);


// --- Page Components ---

const HomePage = ({ id, onNavigate }) => (
  <Provider>  
    <ScrollView contentContainerStyle={styles.page}>
    <FarmDashboard id={id} />
    <WeatherCard />
    <AssistantCard onNavigate={onNavigate} />
  </ScrollView>
  </Provider>

);

const MarketplacePage = () => {
  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}
          <Text style={styles.productUnit}>{item.unit}</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.page}
      data={MOCK_PRODUCTS}
      renderItem={renderProduct}
      keyExtractor={item => item.id}
      numColumns={2}
      ListHeaderComponent={
        <View style={styles.searchContainer}>
          <TextInput placeholder="Search for products..." style={styles.searchInput}/>
        </View>
      }
    />
  );
};


const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Namaste! How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);
  const ai = new GoogleGenAI({apiKey:`AIzaSyAu7L83QcgKKbC19CJTDylDiii22jLZOmQ`}); // ✅ Pass your API key here
  const [chats, setChats] = useState([
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
  ]);
  // ✅ FIXED Gemini call
  const chat = ai.chats.create({
          model: "gemini-2.5-flash",
          history: chats,
        });
  async function Gemini({ prompt }) {
    try {

       const response = await chat.sendMessage({
          message: prompt,
        });

        let formattedText = response.text.replace(/\* /g, '•');
          formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
          setChats((prev) => [...prev, { role: "user", parts: [{ text: prompt }] }, { role: "model", parts: [{ text: formattedText }] }]);
      return formattedText;

    } catch (err) {
      console.error("Gemini API Error:", err);
      return "⚠️ Sorry, there was an error connecting to Gemini.";
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    const userInput = input.trim();
    setInput('');

    // Placeholder bot message (loading state)
    const loadingMessage = { id: (Date.now() + 1).toString(), text: "Thinking...", sender: 'bot' };
    setMessages(prev => [...prev, loadingMessage]);

    // Call Gemini API
    const botReply = await Gemini({ prompt: userInput });

    // Replace "Thinking..." with actual response
    setMessages(prev =>
      prev.map(msg =>
        msg.id === loadingMessage.id ? { ...msg, text: botReply } : msg
      )
    );
  };

  // Auto-scroll
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => (
    <View style={[styles.chatBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={item.sender === 'user' ? styles.userBubbleText : styles.botBubbleText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.chatHeader}>
          <Text style={styles.cardTitle}>🤖 Krishi Assistant</Text>
          <Text style={{ color: '#16a34a' }}>Online</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};


// --- Main App Component ---

const Home = ({navigation,route}) => {
  const {id} = route.params;
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'marketplace':
        return <MarketplacePage />;
      case 'chatbot':
        return <ChatbotPage />;
      case 'home':
      default:
        return <HomePage id={id} onNavigate={handleNavigation} />;
    }
  };
  const [visible, setVisible] = useState(false);
  const voiceAssistant = () => {
    console.log("Voice assistant activated");
    setVisible(true);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f0" />
      <Header onNavigate={handleNavigation} />
      <View style={styles.mainContent}>
        {renderPage()}
      </View>
     <FAB
        icon="microphone-outline"
        style={{
            backgroundColor:"#abed87",
            position: 'absolute',
            margin: 16,
            right: 8,
            bottom: 30,
        }}
        onPress={voiceAssistant}
      />
      <Modal style={{ justifyContent: 'center', flex: 1 }} visible={visible} onDismiss={() => setVisible(false)} 
      contentContainerStyle={{
        backgroundColor: 'white',
                  borderRadius: 20,
                  paddingVertical: 30,
                  paddingHorizontal: 20,
                  width: '80%',
                  alignSelf: 'center',
                  alignItems: 'center',
      }}
      >
        <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Voice Assistant</Text>
        <Text>This feature is under development. Stay tuned!</Text>
        <Button mode="contained" onPress={() => setVisible(false)} style={{marginTop:20}}>
          Close
        </Button>
      </Modal>
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f0f4f0',
  },
  mainContent: {
    paddingTop: 8,
    flex: 1,
  },
  page: {
    padding: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logoContainer: {
      flexDirection: 'row',
      gap:8,
      alignItems: 'center',
  },
  logoIcon: {
      fontSize: 24,
      marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerNav: {
    flexDirection: 'row',
  },
  navButton: {
    marginLeft: 16,
    padding: 8,
  },
  // Generic Card
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  // Farm Dashboard
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#dcfce7',
  },
  tabText: {
    color: '#4b5563',
  },
  activeTabText: {
    color: '#15803d',
    fontWeight: 'bold',
  },
  tabContent: {
    paddingTop: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#374151',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '100%',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  listItem: {
    marginBottom: 4,
  },
  cropItem: {
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 4,
  },
  // Assistant Card
  assistantCard: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assistantTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  assistantSubtitle: {
    color: '#d1fae5',
    fontSize: 14,
  },
  assistantIcon: {
    color: 'white',
    fontSize: 28,
    fontWeight: '200',
  },
  // Marketplace Page
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 8, // Creates the gap for the grid
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#15803d',
  },
  productUnit: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'normal',
  },
  // Chatbot Page
  chatHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatContainer: {
    padding: 10,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  botBubble: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#22c55e',
    alignSelf: 'flex-end',
  },
  botBubbleText: {
    color: '#1f2937',
  },
  userBubbleText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
    bottom:18
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 19,
  },
   weatherHeader: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { fontSize: 20, fontWeight: "bold" },
  weatherLocation: { fontSize: 14, color: "#555" },
  weatherUpdate: { fontSize: 12, color: "#999" },
  weatherMain: { alignItems: "center", marginVertical: 10 },
  weatherTemp: { fontSize: 42, fontWeight: "bold" },
  weatherCondition: { fontSize: 18, textTransform: "capitalize" },
  weatherDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: { width: "48%", marginVertical: 5 },
  detailValue: { fontWeight: "bold" },
  forecastContainer: { marginTop: 10 },
  forecastItem: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#f2f2f2",
    minWidth: 70,
    minHeight: 80
  },
  forecastItemSelected: { backgroundColor: "#cce5ff" },
  forecastIcon: { fontSize: 22 },
  forecastTime: { fontSize: 12, color: "#555" },
  forecastTemp: { fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  suggestionContainer: {
  backgroundColor: "#e9f5e9",
  borderRadius: 12,
  padding: 10,
  marginTop: 10,
  borderLeftWidth: 4,
  borderLeftColor: "#4caf50",
},
suggestionTitle: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#2e7d32",
  marginBottom: 5,
},
suggestionText: {
  fontSize: 14,
  color: "#1b5e20",
},

});

export default Home;