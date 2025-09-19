import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
export function useLocalCropPrice() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const fetchLocalPrice = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission to access location was denied.');
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        let address = await Location.reverseGeocodeAsync({ latitude, longitude });
        
        const market = address[0]?.city;
        const state = address[0]?.region;

        if (!market || !state) {
          throw new Error('Could not determine the city and state from your location.');
        }
        setLocationName(`${market}, ${state}`);
        
        const apiKey = ''; 
        const commodity = 'Paddy(Dhan)';

   
        const apiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=10&filters[state]=${state}&filters[market]=${market}&filters[commodity]=${commodity}`;
        

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        setPriceData(data.records);

      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalPrice();
  }, []);

  return { loading, errorMsg, priceData, locationName };
}
