

import React from 'react';
import { createStackNavigator }      from '@react-navigation/stack';
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View }   from 'react-native';
import MaterialIcons                 from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '../context/AuthContext';

// ── AUTH SCREENS ──────────────────────────────────────
import LoginScreen     from '../screens/auth/LoginScreen';
import RegisterScreen  from '../screens/auth/RegisterScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';

// ── APP SCREENS ───────────────────────────────────────
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProductsScreen  from '../screens/products/ProductsScreen';
import SalesScreen     from '../screens/sales/SalesScreen';
import CustomersScreen from '../screens/customers/CustomersScreen';
import ExpensesScreen  from '../screens/expenses/ExpensesScreen';
import AIScreen        from '../screens/ai/AIScreen';

const Stack  = createStackNavigator();
const Tab    = createBottomTabNavigator();

// ── COLORS ────────────────────────────────────────────
const PRIMARY = '#2563eb';
const GRAY    = '#94a3b8';

// ── BOTTOM TAB NAVIGATOR ─────────────────────────────
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor:   PRIMARY,
      tabBarInactiveTintColor: GRAY,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth:  1,
        borderTopColor:  '#f1f5f9',
        paddingBottom:   8,
        paddingTop:      8,
        height:          65,
        elevation:       10,
        shadowColor:     '#000',
        shadowOffset:    { width: 0, height: -2 },
        shadowOpacity:   0.05,
        shadowRadius:    8,
      },
      tabBarLabelStyle: {
        fontSize:   11,
        fontWeight: '600',
        marginTop:  2,
      },
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Dashboard: 'dashboard',
          Products:  'inventory',
          Sales:     'receipt',
          Customers: 'people',
          Expenses:  'account-balance-wallet',
          AI:        'smart-toy',
        };
        return (
          <MaterialIcons
            name={icons[route.name]}
            size={24}
            color={color}
          />
        );
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Products"  component={ProductsScreen}  />
    <Tab.Screen name="Sales"     component={SalesScreen}     />
    <Tab.Screen name="Customers" component={CustomersScreen} />
    <Tab.Screen name="Expenses"  component={ExpensesScreen}  />
    <Tab.Screen name="AI"        component={AIScreen}        />
  </Tab.Navigator>
);

// ── AUTH STACK ────────────────────────────────────────
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login"     component={LoginScreen}     />
    <Stack.Screen name="Register"  component={RegisterScreen}  />
    <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
  </Stack.Navigator>
);

// ── ROOT NAVIGATOR ────────────────────────────────────
const AppNavigator = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return isLoggedIn ? <TabNavigator /> : <AuthStack />;
};

export default AppNavigator;