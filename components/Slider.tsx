import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Value,
  diffClamp,
  divide,
  set,
  useCode,
  call,
} from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { hsv2color, onGestureEvent, withOffset } from "react-native-redash";
import {LinearGradient} from "expo-linear-gradient";
import { CANVAS_SIZE } from "./Picker";

const width = CANVAS_SIZE - 50;
const SIZE = 30;
const upperBound = width - SIZE;
const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: SIZE / 2,
  },
  slidebar: {
    width,
    height: 5,
    marginTop: SIZE / 2 - 2.5,
    borderRadius: 5,
    position: "absolute",
  },
  cursor: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SIZE / 2,
  },
  shadow: {
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
});

interface SliderProps {
  h: Animated.Value<number>;
  s: Animated.Value<number>;
  v: Animated.Value<number>;
  backgroundColor: Animated.Node<number>;
  onColorChanged?: Function;
}

export default ({ h, s, v, backgroundColor, onColorChanged }: SliderProps) => {
    const one = new Value(1);
  const state = new Value(0);
  const translationX = new Value(0);
  
  const offset = new Value(v._value * (CANVAS_SIZE - 50));
  const gestureHandler = onGestureEvent({
    translationX,
    state,
  });
  const translateX = diffClamp(
    withOffset(translationX, state, offset),
    0,
    upperBound
  );
  useCode(() => set(v, divide(translateX, upperBound)), [translateX, v]);
  useCode(() => {
    return call([state, backgroundColor, v], ([state, backgroundColor, v]) => {
      if (state == State.END) {
        console.log(state, backgroundColor, v);
        onColorChanged?.({
          backgroundColor,
          v,
        });
      }
    });
  }, [state, backgroundColor, v]);
  return (
    <View style={{width: CANVAS_SIZE}}>
      <Animated.View style={[styles.container]}>
        <Animated.View
          style={[
            {
              backgroundColor: hsv2color(h, s, one),
            },
            styles.slidebar,
          ]}
          pointerEvents="none"
        />

        <LinearGradient
          colors={["black", "transparent"]}
          style={styles.slidebar}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
        />

        <PanGestureHandler {...gestureHandler}>
          <Animated.View
            style={[
              styles.cursor,
              styles.shadow,
              { backgroundColor },
              { transform: [{ translateX }] },
            ]}
          />
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
};
