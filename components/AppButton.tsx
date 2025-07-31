import React from "react";
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";

type Variant = "primary" | "secondary";

interface Props {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export const AppButton: React.FC<Props> = ({ title, onPress, disabled = false, variant = "primary", style }) => {
  const bg = variant === "primary" ? "#333" : "#e0e0e0";
  const textColor = variant === "primary" ? "#fff" : "#000";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, { backgroundColor: disabled ? "#9e9e9e" : bg }, style]}
    >
      <Text style={[styles.text,{color:textColor}]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
