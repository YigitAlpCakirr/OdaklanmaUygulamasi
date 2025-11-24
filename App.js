import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from './screens/HomeScreen';
import ReportsScreen from './screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
          name="Ana Sayfa" 
          component={HomeScreen} 
          options={{ title: 'Zamanlayıcı' }}
        />
        <Tab.Screen 
          name="Raporlar" 
          component={ReportsScreen} 
          options={{ title: 'İstatistikler' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}