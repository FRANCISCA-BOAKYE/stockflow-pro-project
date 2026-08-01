import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface Props {
  color?: string;
  spacing?: number;
  dotRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Subtle tiled dot-grid texture — drop into a hero/header section for depth without adding a new color. */
export default function DotGrid({ color = 'rgba(255,255,255,0.35)', spacing = 20, dotRadius = 1.1, style }: Props) {
  return (
    <Svg width="100%" height="100%" style={style} pointerEvents="none">
      <Defs>
        <Pattern id="dotGrid" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <Circle cx={spacing / 2} cy={spacing / 2} r={dotRadius} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dotGrid)" />
    </Svg>
  );
}
