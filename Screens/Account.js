import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { ActivityIndicator, Button, Menu, Provider } from "react-native-paper";
import * as Location from "expo-location";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const AGRO_APPID = "fb01a7d48d692d4c631c64492f069de8"; // Replace with your real key
const BASE_URL = "https://api.agromonitoring.com/agro/1.0";

export default function Account({ navigation = useNavigation(), route }) {
  const { id } = route.params;
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState("English");
  const [name, setName] = useState("");
  const [location, setLocation] = useState(null);
  const [geoJson, setGeoJson] = useState(null);
  const [polygonName, setPolygonName] = useState("");
  const [polygons, setPolygons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  // --- Fetch polygons on mount
  useEffect(() => {
    fetchPolygons();
  }, []);

  const fetchPolygons = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${BASE_URL}/polygons?appid=${AGRO_APPID}`);
      if (!resp.ok) throw new Error("Failed fetching polygons");
      const data = await resp.json();
      setPolygons(data);
    } catch (err) {
      console.error("Error fetching polygons:", err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolygon = useCallback(
    async (allowDuplicate = false) => {
      if (!polygonName || !geoJson) {
        Alert.alert("Missing info", "Polygon name and GeoJSON are required");
        return;
      }

      try {
        setLoading(true);
        let url = `${BASE_URL}/polygons?appid=${AGRO_APPID}`;
        if (allowDuplicate) url += "&duplicated=true";

        const body = {
          name: polygonName,
          geo_json: geoJson,
        };

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (resp.status === 201) {
          const polygon = await resp.json();
          Alert.alert("Success", `Polygon created with ID: ${polygon.id}`);
          fetchPolygons();
        } else {
          const errData = await resp.json();
          console.error("Create polygon error:", errData);
          Alert.alert("Error creating polygon", JSON.stringify(errData));
        }
      } catch (err) {
        console.error("Error creating polygon:", err);
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    },
    [polygonName, geoJson, fetchPolygons]
  );

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationGranted(false);
        Alert.alert("Permission Denied", "Location permission is required to proceed.");
        return null;
      }
      setLocationGranted(true);
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      return loc;
    } catch (err) {
      console.error("Location Error:", err);
      Alert.alert("Error", "Unable to fetch location.");
      return null;
    }
  }, []);

  const analyze = useCallback(async () => {
    const loc = await getCurrentLocation();
    if (!loc) return;

    const { latitude, longitude } = loc.coords;
    const radius = 0.01; // ~1km square
    const fieldGeoJson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [longitude - radius, latitude - radius],
            [longitude + radius, latitude - radius],
            [longitude + radius, latitude + radius],
            [longitude - radius, latitude + radius],
            [longitude - radius, latitude - radius],
          ],
        ],
      },
    };

    setGeoJson(fieldGeoJson);
    setPolygonName(name || "My Field");
    createPolygon();
  }, [getCurrentLocation, name, createPolygon]);

  const submit = useCallback(async () => {
    if (!name || !language || !geoJson) {
      Alert.alert("Missing Info", "Please fill all fields and allow location access.");
      return;
    }
    fetchPolygons();
    try {
      setSubmitting(true);
      const profileDoc = doc(FIREBASE_DB, "Profile", id);
      await setDoc(profileDoc, {
        name:name,
        language:language,
        location: JSON.stringify(geoJson),
        polygon: polygons.length > 0 ? polygons[polygons.length-1].id : null,
        userID: id,
      });
      navigation.navigate("Home");
    } catch (err) {
      console.error("Error saving profile:", err);
      Alert.alert("Error", "Unable to save profile.");
    } finally {
      setSubmitting(false);
    }
  }, [name, language, geoJson, polygons, id, navigation]);

  return (
    <Provider>
      <LinearGradient
        colors={["#bcecd2ff", "#f7f5f5ea"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 }}
      >
        {(submitting || loading) && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{ position: "absolute", top: "50%", left: "45%", zIndex: 1 }}
          />
        )}

        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Create Account</Text>

        <ScrollView style={{ marginTop: 40 }}>
          <View style={{ gap: 20 }}>
            {/* Name Input */}
            <View>
              <Text>Name</Text>
              <TextInput
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  padding: 8,
                  width: 250,
                  marginBottom: 10,
                }}
              />
            </View>

            {/* Language Menu */}
            <View>
              <Text>Preferred Language</Text>
              <Menu
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={<Button onPress={() => setVisible(true)}>{language}</Button>}
              >
                {["English", "Hindi", "Punjabi"].map((lang) => (
                  <Menu.Item
                    key={lang}
                    onPress={() => {
                      setLanguage(lang);
                      setVisible(false);
                    }}
                    title={lang}
                  />
                ))}
              </Menu>
            </View>

            {/* Location Access */}
            <View>
              <Text>Access Location?</Text>
              <TouchableOpacity
                onPress={async () => {
                  if (!name || !language) {
                    Alert.alert("Missing Info", "Please fill all the details.");
                    return;
                  }
                  await analyze();
                }}
                style={{
                  padding: 9,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: geoJson ? "lightgreen" : "white",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>Yes</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={submit}
              style={{
                marginTop: 30,
                padding: 9,
                borderWidth: 1,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: "lightblue",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "bold" }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </Provider>
  );
}
