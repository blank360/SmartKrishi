import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { Portal, Modal, Button, Provider } from "react-native-paper";

export default function Camera() {
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [aiResult, setAiResult] = useState(""); // AI output text
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const cameraRef = useRef(null);

  const ai = new GoogleGenAI({ apiKey: `AIzaSyAu7L83QcgKKbC19CJTDylDiii22jLZOmQ` });

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to access the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFlash = () => setFlash(!flash);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: true,
        });

        setCapturedPhotos((prev) => [...prev, photo.uri]);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  const deletePhoto = (index) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const scan = async () => {
    if (capturedPhotos.length === 0) {
      Alert.alert("No photos", "Please capture at least one photo to scan.");
      return;
    }

    try {
      setLoading(true);
      let contents = ["Analyze these crop images for disease or pest detection:"];

      // Process each photo for AI
      for (const uri of capturedPhotos) {
        const file = new FileSystem.File(uri);
        const base64 = await file.base64();

        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent(contents),
      });

      setAiResult(response.text || "No description returned.");
      setModalVisible(true);
    } catch (error) {
      console.error("AI Error:", error);
      Alert.alert("Error", "Something went wrong while analyzing images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color="white"
        />
      )}

      <CameraView
        style={styles.camera}
        facing={facing}
        enableTorch={flash}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleFlash}>
              <Ionicons
                name={!flash ? "flash-off" : "flash"}
                size={28}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Bottom buttons */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Ionicons name="camera" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={scan}>
              <Ionicons name="sparkles-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Preview captured images */}
      {capturedPhotos.length > 0 && (
        <ScrollView
          horizontal
          style={styles.previewScroll}
          contentContainerStyle={styles.previewContent}
        >
          {capturedPhotos.map((uri, index) => (
            <View key={index} style={styles.previewWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePhoto(index)}
              >
                <Ionicons name="close-circle" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal for AI Result */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>AI Analysis Result</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            <Text style={styles.modalText}>{aiResult}</Text>
          </ScrollView>
          <Button mode="contained" onPress={() => setModalVisible(false)}>
            Close
          </Button>
        </Modal>
      </Portal>
    </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  message: { textAlign: "center", paddingBottom: 10, color: "white" },
  permissionButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  permissionText: { color: "white", fontWeight: "bold" },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: "space-between" },
  loader: { position: "absolute", top: "50%", left: "50%", marginLeft: -12 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 35,
    alignItems: "center",
  },
  bottomBar: {
    alignItems: "center",
    marginBottom: 90,
    alignSelf: "center",
    flexDirection: "row",
    gap: 20,
  },
  captureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  previewScroll: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
    paddingVertical: 10,
  },
  previewContent: { flexDirection: "row", paddingHorizontal: 10, gap: 10 },
  previewWrapper: { position: "relative" },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
    marginRight: 10,
  },
  deleteButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
  },
  modalContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, color: "#333" },
});
