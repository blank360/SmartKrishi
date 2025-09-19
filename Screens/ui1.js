import React, { useState, useEffect, useRef, useCallback } from 'react';
import {StyleSheet,Text,View,StatusBar,TouchableOpacity,ScrollView,TextInput,Image,FlatList,KeyboardAvoidingView,Platform,} from 'react-native';
import { GoogleGenAI } from "@google/genai";
import { useNavigation } from '@react-navigation/native';
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
        <Text style={styles.logoIcon}>🌿</Text>
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

const FarmDashboard = () => {
  const [activeTab, setActiveTab] = useState('soil');
  const nav = useNavigation();
  const renderTabContent = () => {
    switch (activeTab) {
      case 'fertilizer':
        return (
          <View>
            <Text style={styles.contentTitle}>Personalized Fertilizer Plan</Text>
            <Text style={styles.listItem}>• <Text style={{fontWeight: 'bold'}}>Basal:</Text> Apply 50kg Urea & 120kg SSP/acre.</Text>
            <Text style={styles.listItem}>• <Text style={{fontWeight: 'bold'}}>25 Days:</Text> Apply 40kg Urea/acre.</Text>
          </View>
        );
      case 'crop':
        return (
          <View>
            <Text style={styles.contentTitle}>Recommended Crops</Text>
            <View style={styles.cropItem}><Text><Text style={{fontWeight: 'bold'}}>Paddy (Rice):</Text> High market demand, MSP support.</Text></View>
            <View style={styles.cropItem}><Text><Text style={{fontWeight: 'bold'}}>Moong Dal:</Text> Improves soil N, low water use.</Text></View>
          </View>
        );
      case 'soil':
      default:
        return (
          <View>
            <Text style={styles.contentTitle}>Soil Health Report</Text>
            {/* pH Level */}
            <View style={styles.progressContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}><Text style={styles.progressLabel}>pH Level</Text><Text style={styles.progressValue}>6.8 (Optimal)</Text></View>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: '75%', backgroundColor: '#22c55e'}]} /></View>
            </View>
            {/* Nitrogen */}
            <View style={styles.progressContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}><Text style={styles.progressLabel}>Nitrogen (N)</Text><Text style={styles.progressValue}>Low</Text></View>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: '45%', backgroundColor: '#f97316'}]} /></View>
            </View>
            {/* Phosphorus */}
            <View style={styles.progressContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}><Text style={styles.progressLabel}>Phosphorus (P)</Text><Text style={styles.progressValue}>Good</Text></View>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: '85%', backgroundColor: '#22c55e'}]} /></View>
            </View>
            {/* Potassium */}
            <View style={styles.progressContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}><Text style={styles.progressLabel}>Potassium (K)</Text><Text style={styles.progressValue}>Medium</Text></View>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: '65%', backgroundColor: '#eab308'}]} /></View>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>My Farm Dashboard</Text>
        <TouchableOpacity onPress={()=>{
          nav.navigate("CameraScreen");
        }} style={{padding:2}}>
          <Image source={require('../assets/Camera.png')} style={{width: 24, height: 24}}/>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('soil')} style={[styles.tab, activeTab === 'soil' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'soil' && styles.activeTabText]}>Soil Data</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('fertilizer')} style={[styles.tab, activeTab === 'fertilizer' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'fertilizer' && styles.activeTabText]}>Fertilizer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('crop')} style={[styles.tab, activeTab === 'crop' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'crop' && styles.activeTabText]}>Crops</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const WeatherCard = () => (
  <View style={styles.card}>
    <View style={styles.weatherHeader}>
      <Text style={styles.cardTitle}>☀️ Current Weather</Text>
      <View>
        <Text style={styles.weatherLocation}>Bhubaneswar, Odisha</Text>
        <Text style={styles.weatherUpdate}>Updated just now</Text>
      </View>
    </View>
    <View style={styles.weatherMain}>
      <Text style={styles.weatherTemp}>29°C</Text>
      <Text style={styles.weatherCondition}>Sunny</Text>
    </View>
    <View style={styles.weatherDetails}>
      <View style={styles.detailItem}><Text>💧 Humidity</Text><Text style={styles.detailValue}>85%</Text></View>
      <View style={styles.detailItem}><Text>💨 Wind Speed</Text><Text style={styles.detailValue}>12 km/h</Text></View>
      <View style={styles.detailItem}><Text>🌡️ Pressure</Text><Text style={styles.detailValue}>1013 hPa</Text></View>
      <View style={styles.detailItem}><Text>👁️ Visibility</Text><Text style={styles.detailValue}>10 km</Text></View>
    </View>
    <View style={styles.forecastContainer}>
        <View style={styles.forecastItem}><Text>Today</Text><Text style={styles.forecastIcon}>☀️</Text><Text>29°/24°</Text></View>
        <View style={styles.forecastItem}><Text>Fri</Text><Text style={styles.forecastIcon}>☁️</Text><Text>28°/23°</Text></View>
        <View style={styles.forecastItem}><Text>Sat</Text><Text style={styles.forecastIcon}>💧</Text><Text>27°/22°</Text></View>
    </View>
  </View>
);

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

const HomePage = ({ onNavigate }) => (
  <ScrollView contentContainerStyle={styles.page}>
    <FarmDashboard />
    <WeatherCard />
    <AssistantCard onNavigate={onNavigate} />
  </ScrollView>
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

const App = () => {
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
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f0" />
      <Header onNavigate={handleNavigation} />
      <View style={styles.mainContent}>
        {renderPage()}
      </View>
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
  // Weather Card
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  weatherLocation: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'right',
  },
  weatherUpdate: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  weatherMain: {
    marginBottom: 16,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  weatherCondition: {
    fontSize: 18,
    color: '#4b5563',
  },
  weatherDetails: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailValue: {
    fontWeight: '600',
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastIcon: {
    fontSize: 24,
    marginVertical: 4,
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
});

export default App;