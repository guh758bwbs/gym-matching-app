import React from 'react';
import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import ProfileDetailScreen from './src/screens/ProfileDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import ReviewScreen from './src/screens/ReviewScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen}
          options={{ title: 'プロフィール設定' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'ホーム' }}
        />
        <Stack.Screen 
          name="ProfileDetail" 
          component={ProfileDetailScreen}
          options={{ title: 'プロフィール詳細' }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params?.chatPartnerName || 'チャット'
          })}
        />
        <Stack.Screen 
          name="Schedule" 
          component={ScheduleScreen}
          options={{ title: 'スケジュール調整' }}
        />
        <Stack.Screen 
          name="ProfileEdit" 
          component={ProfileEditScreen}
          options={{ title: 'プロフィール編集' }}
        />
        <Stack.Screen 
          name="Review" 
          component={ReviewScreen}
          options={{ title: 'レビュー' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

AppRegistry.registerComponent('main', () => App);