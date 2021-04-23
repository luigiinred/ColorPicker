/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import ColorPickerScreeen from '../screens/ColorPickerScreeen';
// import TabTwoScreen from '../screens/TabTwoScreen';
import { TabOneParamList } from '../types';


// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const TabOneStack = createStackNavigator<TabOneParamList>();

function TabOneNavigator() {
  return (
    <TabOneStack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0, // remove shadow on Android
          shadowOpacity: 0, //
        },
      }}
    >
      <TabOneStack.Screen
        name="ColorPickerScreeen"
        component={ColorPickerScreeen}
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f4511e",
          },
        }}
        options={{ headerTitle: "New Color" }}
      />
    </TabOneStack.Navigator>
  );
}
export default TabOneNavigator;