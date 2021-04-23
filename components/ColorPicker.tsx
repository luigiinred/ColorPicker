/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
// @ts-ignore
import { Surface } from "gl-react-expo";
// @ts-ignore
import { GLSL, Node, Shaders } from "gl-react";
import Animated, {
  Extrapolate,
  interpolateNode,
  useSharedValue,
  Value,
} from "react-native-reanimated";
import { hsv2color, vec } from "react-native-redash";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Picker, { CANVAS_SIZE } from "./Picker";
import Slider from "./Slider";
import { HSVtoRGB } from "../utils/color";

const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialCommunityIcons);
const ICON_SIZE = 32
interface Color {
  h: number;
  s: number;
  v: number;
  x: number;
  y: number;
  backgroundColor: number;
}

const styles = StyleSheet.create({
  header:{
    fontSize:20,
    fontWeight:'bold'
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  surface: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: "white",
  },
  presetContainer: {
    flexDirection: "row",
    width: CANVAS_SIZE,
    alignItems: "center",
    alignContent: "center",
  },
  sliderContainer: {
    flexDirection: "row",
    width: CANVAS_SIZE,
    position: "relative",
    left: -ICON_SIZE,
    alignItems: "center",
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

const shaders = Shaders.create({
  hue: {
    frag: GLSL`
#define PI  3.141592653589793
#define TAU 6.283185307179586
precision highp float;
varying vec2 uv;
uniform float size;
// https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
float quadraticIn(float t) {
  return t * (t - 0.05);
}
void main() {
  float mag = distance(uv, vec2(0.5));
  vec2 pos = vec2(0.5) - uv;
  float a = atan(pos.y, pos.x);
  float progress = a * 0.5 / PI + 0.5;
  gl_FragColor = mag < 0.5 ? vec4(hsv2rgb(vec3(progress, mag * 2.0, 1.0)), 1.0) : vec4(1.0, 1.0, 1.0, 0.0);
}
`,
  },
});

export default ({ navigation }) => {

  useEffect(() =>{
    navigation.setOptions({
      headerTitle: () => <Animated.Text style={[styles.header,{color:backgroundColor}]}>New Color</Animated.Text>,
    });
  },[])

  const defaultColors = [
    {
      backgroundColor: 4282056500,
      h: 0.3284504199180784,
      s: 0.7945917190608016,
      v: 0.5,
      x: -47,
      y: -87.5,
    },
    {
      backgroundColor: 4294910274,
      h: 0.9757884538330656,
      s: 0.8693210573319355,
      v: 1,
      x: 143.5,
      y: 22,
    },
    {
      backgroundColor: 4279506687,
      h: 0.6648757194115371,
      s: 0.9222042914324535,
      v: 1,
      x: -78.5,
      y: 132.5,
    },
  ];

  const [color, setColor] = useState<Color>(
    defaultColors[0] || {
      h: 0,
      s: 0,
      x: 0,
      y: 0,
      backgroundColor: 0,
    }
  );

  const springBack = useSharedValue(0);

  const initialY = color.y;
  const initialX = color.x;
  const h = new Value(color.h);
  const s = new Value(color.s);
  const v = new Value(color.v);
  const translation = vec.createValue(0, 0);
  const backgroundColor = hsv2color(h, s, v);

  const updateColor = (colorChanges: Partial<Color>) => {
    setColor({ ...color, ...colorChanges });
  };

  const containerDiamater = interpolateNode(
    Animated.add(
      Animated.abs(translation.x),
      Animated.abs(translation.y),
      springBack.value
    ),
    {
      inputRange: [-50, 0, 50, 300],
      outputRange: [
        CANVAS_SIZE + 200,
        CANVAS_SIZE + 100,
        CANVAS_SIZE + 60,
        CANVAS_SIZE + 0,
      ],
      extrapolate: Extrapolate.CLAMP,
    }
  );
  const containerBoarderWidth = interpolateNode(
    Animated.add(
      Animated.abs(translation.x),
      Animated.abs(translation.y),
      springBack.value
    ),
    {
      inputRange: [-300, -50, 0, 50, 300],
      outputRange: [0, 60, +50, 30, 0],
      extrapolate: Extrapolate.CLAMP,
    }
  );
  const containerDiamaterSmall = interpolateNode(
    Animated.add(Animated.abs(translation.x), Animated.abs(translation.y)),
    {
      inputRange: [-300, -50, 0, 50, 300],
      outputRange: [
        CANVAS_SIZE + 0,
        CANVAS_SIZE + 30,
        CANVAS_SIZE + 50,
        CANVAS_SIZE + 30,
        CANVAS_SIZE + 0,
      ],
      extrapolate: Extrapolate.CLAMP,
    }
  );
  const containerBoarderWidthSmall = interpolateNode(
    Animated.add(Animated.abs(translation.x), Animated.abs(translation.y)),
    {
      inputRange: [-300, -50, 0, 50, 300],
      outputRange: [0 + 1, 15 + 1, +25 + 1, 15 + 1, 0 + 1], // Adding one to the output to give it a slight overlap on the gradient
      extrapolate: Extrapolate.CLAMP,
    }
  );
  return (
    <View style={styles.container}>
      <View
        style={{
          marginTop: 75,
          height: CANVAS_SIZE,
          width: CANVAS_SIZE,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Surface style={styles.surface}>
          <Node shader={shaders.hue} />
        </Surface>
        <View // This ring prevents a bug with iphones on night shift displaying the gl background
          pointerEvents="none"
          style={[
            {
              backgroundColor: "transparent",
              borderRadius: CANVAS_SIZE + 100 / 2,
              borderWidth: 50,
              borderColor: "white",
              height: CANVAS_SIZE + 100,
              width: CANVAS_SIZE + 100,
            },
            {
              position: "absolute",
            },
          ]}
        ></View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              backgroundColor: "black",
              borderRadius: CANVAS_SIZE / 2,

              opacity: Animated.sub(1, v), //Animated.sub(1, v),
              height: CANVAS_SIZE,
              width: CANVAS_SIZE,
            },
            {
              position: "absolute",
            },
          ]}
        ></Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              backgroundColor: "transparent",
              borderColor: backgroundColor,
              borderRadius: 500,
              opacity: 0.5,
              height: containerDiamater,
              width: containerDiamater,
              borderWidth: containerBoarderWidth,
            },
            {
              position: "absolute",
            },
          ]}
        ></Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            {
              backgroundColor: "transparent",
              borderColor: backgroundColor,
              borderRadius: 500,
              opacity: 1,
              height: containerDiamaterSmall,
              width: containerDiamaterSmall,
              borderWidth: containerBoarderWidthSmall,
            },
            {
              position: "absolute",
            },
          ]}
        ></Animated.View>
        <Picker
          key={`${color.backgroundColor}${Math.random()}`}
          translation={translation}
          initialX={initialX}
          initialY={initialY}
          onColorChanged={updateColor as any}
          h={h}
          s={s}
          v={v}
          backgroundColor={backgroundColor}
        />
      </View>
      <View style={styles.sliderContainer}>
        <AnimatedMaterialIcons
          name="lightbulb"
          size={ICON_SIZE}
          color={backgroundColor}
          style={styles.shadow}
        />
        <View>
          <Slider
            key={`${color.backgroundColor}${Math.random()}`}
            onColorChanged={updateColor as any}
            {...{ h, s, v, backgroundColor }}
          />
        </View>

        <AnimatedMaterialIcons
          name="lightbulb-on-outline"
          size={ICON_SIZE}
          color={backgroundColor}
          style={styles.shadow}
        />
      </View>

      <View style={styles.presetContainer}>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              backgroundColor: backgroundColor,
              borderRadius: 1000,
              opacity: 0.5,
              height: 1000,
              width: 1000,
              top: -50,
              left: CANVAS_SIZE / 2 - 500,
              alignSelf: "center",
            },
            {
              position: "absolute",
            },
          ]}
        ></Animated.View>
        {defaultColors.map((defaultColor) => (
          <Pressable
            onPress={() => setColor(defaultColor)}
            key={defaultColor.backgroundColor}
          >
            <Animated.View
              style={[
                {
                  width: 48,
                  height: 48,
                  margin: 16,
                  marginBottom: 48,
                  backgroundColor: hsv2color(
                    defaultColor.h,
                    defaultColor.s,
                    defaultColor.v
                  ),
                  borderRadius: 32,
                },
                styles.shadow,
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
};
