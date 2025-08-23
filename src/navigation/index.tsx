import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

import { colors } from '../theme/colors';
import { selectCartTotalItems } from '../store/slices/cartSlice';

// screens
import MainHomeScreen from '../screens/MainHomeScreen';
import ServingMethodScreen from '../screens/ServingMethodScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import HomeScreen from '../screens/HomeScreen'; // using as Feedback placeholder
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import PickupLocationScreen from '../screens/PickupLocationScreen';
import PrasadSelectionScreen from '../screens/PrasadSelectionScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';

// ---------- Home stack (keeps tab bar while pushing "Serving") ----------
const HomeStack = createNativeStackNavigator();
function HomeStackNavigator() {
  return (
 <HomeStack.Navigator screenOptions={{ headerShown: false }}>
  <HomeStack.Screen name="MainHome" component={MainHomeScreen} />
  <HomeStack.Screen name="Serving" component={ServingMethodScreen} />
  <HomeStack.Screen name="Location" component={PickupLocationScreen} />
  <HomeStack.Screen name="Ordersummary" component={OrderSummaryScreen} />

</HomeStack.Navigator>
  );
}

// ---------- Tabs (exactly 5) ----------
const Tab = createBottomTabNavigator();
function TabNavigator() {
  const cartTotalItems = useSelector(selectCartTotalItems);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={
              route.name === 'Home'     ? 'home' :
              route.name === 'Cart'     ? 'cart' :
              route.name === 'Orders'   ? 'receipt' :
              route.name === 'Feedback' ? 'message-text' :
              route.name === 'Profile'  ? 'account-circle' : 'help'
            }
            color={color}
            size={size}
          />
        ),
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      })}
    >
      {/* 1) HOME tab is the stack that also contains Serving */}
      <Tab.Screen name="Home" component={HomeStackNavigator} />

      {/* 2) CART */}
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarBadge: cartTotalItems > 0 ? cartTotalItems : undefined }}
      />

      {/* 3) ORDERS */}
      <Tab.Screen name="Orders" component={OrdersScreen} />

      {/* 4) FEEDBACK (using HomeScreen as placeholder) */}
      <Tab.Screen name="Feedback" component={HomeScreen} />

      {/* 5) PROFILE */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ---------- Root stack (handles auth vs app) ----------
const RootStack = createNativeStackNavigator();

export default function Navigation() {
  const isLoggedIn = false; // wire up to your auth state when ready

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={isLoggedIn ? 'Parasad' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Parasad" component={PrasadSelectionScreen} />



        <RootStack.Screen name="MainTabs" component={TabNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
