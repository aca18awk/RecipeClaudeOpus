/**
 * Small icons drawn with plain Views so the app needs no icon library.
 * All icons are decorative: the surrounding control provides the accessible label.
 */
import { StyleSheet, View, type ColorValue } from 'react-native';

type IconProps = {
  color: ColorValue;
  size?: number;
};

type PotIconProps = IconProps & {
  filled?: boolean;
  /** Colour of the details drawn on a filled pot. */
  fillDetailColor?: ColorValue;
};

/** Cooking pot with lid and side handles; 24×24 design grid scaled by `size`. */
export function PotIcon({ color, size = 24, filled = false, fillDetailColor }: PotIconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }} importantForAccessibility="no-hide-descendants">
      {/* Lid knob */}
      <View
        style={{
          position: 'absolute',
          top: 3 * s,
          left: 10 * s,
          width: 4 * s,
          height: 2.5 * s,
          borderTopLeftRadius: 1.5 * s,
          borderTopRightRadius: 1.5 * s,
          backgroundColor: color,
        }}
      />
      {/* Lid */}
      <View
        style={{
          position: 'absolute',
          top: 5.5 * s,
          left: 3 * s,
          width: 18 * s,
          height: 2.5 * s,
          borderRadius: 1.25 * s,
          backgroundColor: color,
        }}
      />
      {/* Handles */}
      <View
        style={{
          position: 'absolute',
          top: 11 * s,
          left: 1 * s,
          width: 3 * s,
          height: 2 * s,
          borderRadius: 1 * s,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 11 * s,
          right: 1 * s,
          width: 3 * s,
          height: 2 * s,
          borderRadius: 1 * s,
          backgroundColor: color,
        }}
      />
      {/* Body */}
      <View
        style={{
          position: 'absolute',
          top: 9 * s,
          left: 4 * s,
          width: 16 * s,
          height: 12 * s,
          borderWidth: 2 * s,
          borderColor: color,
          borderTopLeftRadius: 1 * s,
          borderTopRightRadius: 1 * s,
          borderBottomLeftRadius: 5 * s,
          borderBottomRightRadius: 5 * s,
          backgroundColor: filled ? color : 'transparent',
        }}
      />
      {/* Heart detail on a filled pot reinforces the "saved" state beyond colour. */}
      {filled && fillDetailColor ? (
        <View
          style={{
            position: 'absolute',
            top: 12.5 * s,
            left: 10.5 * s,
            width: 3 * s,
            height: 3 * s,
            borderRadius: 1.5 * s,
            backgroundColor: fillDetailColor,
          }}
        />
      ) : null}
    </View>
  );
}

export function PlusIcon({ color, size = 24 }: IconProps) {
  const thickness = Math.max(2, size / 10);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View style={{ position: 'absolute', width: size * 0.75, height: thickness, borderRadius: thickness, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: thickness, height: size * 0.75, borderRadius: thickness, backgroundColor: color }} />
    </View>
  );
}

export function MinusIcon({ color, size = 24 }: IconProps) {
  const thickness = Math.max(2, size / 10);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View style={{ width: size * 0.75, height: thickness, borderRadius: thickness, backgroundColor: color }} />
    </View>
  );
}

export function HomeIcon({ color, size = 24 }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      {/* Roof: a rotated square, clipped by the body below it */}
      <View
        style={{
          position: 'absolute',
          top: 4 * s,
          left: 5.5 * s,
          width: 13 * s,
          height: 13 * s,
          borderTopWidth: 2 * s,
          borderLeftWidth: 2 * s,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 10 * s,
          left: 5 * s,
          width: 14 * s,
          height: 11 * s,
          borderWidth: 2 * s,
          borderTopWidth: 0,
          borderColor: color,
        }}
      />
      {/* Door */}
      <View
        style={{
          position: 'absolute',
          top: 14 * s,
          left: 10.5 * s,
          width: 3 * s,
          height: 7 * s,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function SearchIcon({ color, size = 20 }: IconProps) {
  const s = size / 20;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: 2 * s,
          left: 2 * s,
          width: 12 * s,
          height: 12 * s,
          borderRadius: 6 * s,
          borderWidth: 2 * s,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 14.5 * s,
          left: 11.5 * s,
          width: 7 * s,
          height: 2 * s,
          borderRadius: 1 * s,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/** Three horizontal bars of decreasing width — the usual "filter" glyph. */
export function FilterIcon({ color, size = 20 }: IconProps) {
  const s = size / 20;
  const bar = (width: number) => (
    <View style={{ width: width * s, height: 2 * s, borderRadius: s, backgroundColor: color }} />
  );
  return (
    <View style={[styles.center, { width: size, height: size, gap: 3.5 * s }]}>
      {bar(16)}
      {bar(11)}
      {bar(6)}
    </View>
  );
}

export function ClockIcon({ color, size = 16 }: IconProps) {
  const s = size / 16;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5 * s,
        borderColor: color,
      }}>
      <View
        style={{
          position: 'absolute',
          top: 3 * s,
          left: 6 * s,
          width: 1.5 * s,
          height: 4 * s,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 5.5 * s,
          left: 6 * s,
          width: 3.5 * s,
          height: 1.5 * s,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function CheckIcon({ color, size = 16 }: IconProps) {
  const s = size / 16;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: 2 * s,
          left: 5 * s,
          width: 6 * s,
          height: 10 * s,
          borderBottomWidth: 2.5 * s,
          borderRightWidth: 2.5 * s,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function CloseIcon({ color, size = 20 }: IconProps) {
  const thickness = Math.max(2, size / 10);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View style={{ position: 'absolute', width: size * 0.85, height: thickness, borderRadius: thickness, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', width: size * 0.85, height: thickness, borderRadius: thickness, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
