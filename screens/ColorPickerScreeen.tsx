import * as React from 'react';
import { StyleSheet, View } from "react-native";

import ColorPicker from "../components/ColorPicker";

export default function TabOneScreen({navigation}) {
  return (
    <View style={styles.container}>
      <ColorPicker navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  
});
