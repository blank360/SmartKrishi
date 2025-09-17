import {View,Text} from 'react-native';

export default function Home({navigation}){
    return(
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{textAlign:'center',fontSize:28,fontWeight:800}}>Hey there !!</Text>
        </View>
    )
}