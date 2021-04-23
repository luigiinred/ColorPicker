/* eslint-disable max-len */
import React from "react";
import { StyleSheet, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Value,
  call,
  cond,
  divide,
  eq,
  modulo,
  set,
  useCode,
} from "react-native-reanimated";
import {
  canvas2Polar,
  clamp,
  onGestureEvent,
  polar2Canvas,
  translate,
  vec,
  withOffset,
} from "react-native-redash";

const AnimatedPath = Animated.createAnimatedComponent(Circle);

const PICKER_WIDTH = 40;
const STROKE_WIDTH = 4;
export const CANVAS_SIZE = 250;
const CENTER = {
  x: CANVAS_SIZE / 2,
  y: CANVAS_SIZE / 2,
};

interface PickerProps {
  initialX: number;
  initialY: number;
  h: Animated.Value<number>;
  s: Animated.Value<number>;
  v: Animated.Value<number>;
  translation: { x: Animated.Value<number>; y: Animated.Value<number> };
  backgroundColor: Animated.Node<number>;
  onColorChanged: ({}) => void;
}

export default ({ h, s, initialX, initialY, translation, backgroundColor, onColorChanged }: PickerProps) => {
  const state = new Value(State.UNDETERMINED);
  const gestureHandler = onGestureEvent({
    state,
    translationX: translation.x,
    translationY: translation.y,
  });
  const offset = {
    x: withOffset(translation.x, state),
    y: withOffset(translation.y, state),
  };
  const v2 = vec.add(offset, CENTER, {x:initialX, y:initialY});
  const polar = canvas2Polar(v2, CENTER);
  const l = {
    theta: polar.theta,
    radius: clamp(polar.radius, 0, CANVAS_SIZE / 2),
  };
  const hue = divide(modulo(l.theta, 2 * Math.PI), 2 * Math.PI);
  const saturation = cond(
    eq(l.radius, 0),
    0,
    divide(l.radius, CANVAS_SIZE / 2)
  );
  useCode(() => [set(h, hue), set(s, saturation)], [
    h,
    hue,
    s,
    saturation,
  ]);

  useCode(() => {
    return call(
      [state, backgroundColor, h, s, v2.x, v2.y],
      ([state, backgroundColor, h, s, x, y ]) => {
        if (state == State.END) {
          console.log(state, backgroundColor);
          onColorChanged?.({ backgroundColor, h, s, x: x - CENTER.x, y:y - CENTER.y});
        }
      }
    );
  }, [state,backgroundColor, h, s, v2.x, v2.y]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.0,
            elevation: 24,
            transform: [
              ...translate(polar2Canvas(l, CENTER)),
              ...translate({
                x: -PICKER_WIDTH / 2,
                y: -PICKER_WIDTH / 2,
              }),
            ],
          }}
        >
          <Svg
            width={PICKER_WIDTH + STROKE_WIDTH * 2}
            height={PICKER_WIDTH + STROKE_WIDTH * 2}
            style={{ top: -PICKER_WIDTH / 4 - STROKE_WIDTH }}
            viewBox={`-${STROKE_WIDTH / 2} -${STROKE_WIDTH / 2} ${
              (PICKER_WIDTH + STROKE_WIDTH) * 2
            } ${PICKER_WIDTH + STROKE_WIDTH * 4}`}
          >
            <AnimatedPath
              cx={PICKER_WIDTH}
              cy={PICKER_WIDTH}
              r={PICKER_WIDTH / 2}
              fill={backgroundColor}
              stroke="#fff"
              strokeWidth={STROKE_WIDTH}
              fillRule="evenodd"
            />
          </Svg>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};