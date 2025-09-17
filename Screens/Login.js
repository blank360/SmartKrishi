import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { getAuth, signInWithPhoneNumber } from "firebase/auth";
import { FIREBASE_APP } from "../firebaseConfig";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const recaptchaVerifier = useRef(null);

  const auth = getAuth(FIREBASE_APP);

  const sendVerification = async () => {
    try {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const id = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(id);
      alert("OTP sent!");
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmCode = async () => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        otp
      );
      await auth.signInWithCredential(credential);
      alert("Phone authentication successful!");
    } catch (err) {
      alert("Invalid code.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={FIREBASE_APP.options}
      />
      {!verificationId ? (
        <>
          <TextInput
            placeholder="Phone Number"
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={{ borderWidth: 1, padding: 8, width: 200, marginBottom: 10 }}
          />
          <TouchableOpacity onPress={sendVerification}>
            <Text>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            placeholder="OTP"
            onChangeText={setOtp}
            keyboardType="number-pad"
            style={{ borderWidth: 1, padding: 8, width: 200, marginBottom: 10 }}
          />
          <TouchableOpacity onPress={confirmCode}>
            <Text>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}