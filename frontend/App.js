import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-elements';
import LoginForm from './Components/LoginForm';
import MapPage from './Components/Map';
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

function LoginScreen({ navigation }) {
  return (
    <LoginForm navigation={navigation} />
  )
}

function MapScreen({ navigation }) {
  return (
    <MapPage navigation={ navigation }/>
  );
}

function SettingScreen({navigation}) {
  return (<View style={styles.userProfileButtonContainer}>
    <Button style={styles.goBackButtonStyle} onPress={() => { navigation.goBack() }}></Button>
  </View>);
}

function HelpScreen({ navigation }) {
  return (<View style={styles.userProfileButtonContainer}>
    <Button style={styles.goBackButtonStyle} onPress={() => {navigation.goBack()}}></Button>
    
  </View>);
}
const Drawer = createDrawerNavigator();

function UserProfileDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Login" component={LoginScreen} />
      <Drawer.Screen name="Map" component={MapScreen} />
      <Drawer.Screen name="Setting" component={SettingScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      {/* <DrawerItem></DrawerItem> */}
      <UserProfileDrawer />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  userProfileButtonContainer: {
    backgroundColor: 'black',
    // position: 'absolute', //use absolute position to show button on top of the map
    // top: '100%',
    // right: '0%',
    flex: 1,
  },
  goBackButtonStyle: {
    paddingTop: 50,
    position: 'absolute',
    top: '40%',
    right: '20%',
  }
});