import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { CONFIG, FIREBASE_APP } from "../firebaseConfig";
import auth, { getAuth, onAuthStateChanged, signInWithPhoneNumber } from "@react-native-firebase/auth";
import { getApp, initializeApp } from "@react-native-firebase/app";

export default function Login({navigation}) {
  const [change,setchange] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [confirm,setconfirm] = useState(null);
  initializeApp(CONFIG);
  const firebaseApp = getApp();
  const signinWithPhoneNumber = async () =>{
      try{
           const confirmation = await signInWithPhoneNumber(getAuth(firebaseApp), phoneNumber);
           setconfirm(confirmation);
      }catch(e){
        console.error("Error sending code :-\n"+e);
      }
  };
 const confirmCode = async () =>{
    try{
        const userCredential = await confirm.confirm(otp);
        const user  = userCredential.user;
        console.log(user);
        setVerificationId(user.uid);
    }catch(e){
      console.error("Error verifying code :-\n"+e);
    }
 };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(getAuth(firebaseApp), (user) => {
    if (user) {
      navigation.replace("Home");
    }
  });
  return unsubscribe;
}, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center",backgroundColor:"pink" }}>
      {
        !change &&(
          <View style={{flexDirection:"column",gap:20}}>
          <TouchableOpacity onPress={()=>{ setchange(true); }} style={{padding:9,borderWidth:1,borderRadius:10,alignItems:"center",alignContent:"center"}}>
              <Text style={{fontSize:15,textAlign:"center",fontWeight:"bold"}}>Login</Text>
          </TouchableOpacity>
          <Text style={{fontSize:11,color:"grey"}}>New ? Create Account !</Text>
          </View>
        )
      }
      {
        change && 
         (!confirm ? (
        <>
          <Text style={{fontWeight:"bold",fontSize:19}}>Enter  your Phone Number</Text>
          <TextInput
            placeholder="+91 9876543210"
            onChangeText={(t)=>{
              setPhoneNumber(t);
            }}
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 8,
              width: 250,
              marginBottom: 10,
            }}
          />
          <TouchableOpacity
            onPress={signinWithPhoneNumber}
            style={{
              backgroundColor: "#4CAF50",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#fff" }}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
        <Text style={{fontWeight:"bold",fontSize:19}}>Confirm the otp :- </Text>
          <TextInput
            placeholder="Enter OTP"
            onChangeText={(t)=>{
              setOtp(t);
            }}
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 8,
              width: 250,
              marginBottom: 10,
            }}
          />
          <TouchableOpacity
            onPress={confirmCode}
            style={{
              backgroundColor: "#2196F3",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#fff" }}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )
    )
    }
    </View>
  );
}
