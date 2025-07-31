import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View, Dimensions, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  images: string[];
  height?: number;
  autoInterval?: number; // ms
}

const { width } = Dimensions.get("window");

export const ImageCarousel: React.FC<Props> = ({ images, height = 220, autoInterval = 5000 }) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);

  // Prefetch all images when component mounts / images change
  useEffect(() => {
    images.forEach((uri) => {
      Image.prefetch(uri);
    });
  }, [images]);

  const goNext = () => {
    if (!images.length) return;
    const next = (index + 1) % images.length;
    setNextIdx(next);
    overlayOpacity.setValue(0);
  };

  const goPrev = () => {
    if (!images.length) return;
    const prev = (index - 1 + images.length) % images.length;
    setNextIdx(prev);
    overlayOpacity.setValue(0);
  };

  useEffect(() => {
    if (!images?.length || paused) return;
    const id = setTimeout(() => {
      goNext();
    }, autoInterval);
    return () => clearTimeout(id);
  }, [images, autoInterval, paused, index]);

  return (
    <View style={{ position: 'relative', backgroundColor: '#222' }}>
      <Pressable style={{ width, height }} onPressIn={() => setPaused(true)} onPressOut={() => setPaused(false)}>
        <Image
          source={{ uri: images[index] }}
          style={{ width, height }}
          resizeMode="cover"
        />
        {nextIdx !== null && (
          <Animated.Image
            source={{ uri: images[nextIdx] }}
            onLoad={() => {
              Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
                if (nextIdx !== null) {
                  setIndex(nextIdx);
                  setNextIdx(null);
                }
              });
            }}
            style={{ width, height, position: 'absolute', top: 0, left: 0, opacity: overlayOpacity }}
            resizeMode="cover"
          />
        )}
      </Pressable>
      {images.length > 1 && (
        <>
          <Pressable style={[styles.arrow, { left: 10 }]} onPress={goPrev}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
          <Pressable style={[styles.arrow, { right: 10 }]} onPress={goNext}>
            <Ionicons name="chevron-forward" size={28} color="#fff" />
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    position: 'absolute',
    top: '45%',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: 20,
  },
});
