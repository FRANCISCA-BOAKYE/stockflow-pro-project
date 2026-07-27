import { TextStyle } from 'react-native';

// Named type scale so every screen pulls from the same sizes/weights instead
// of ad-hoc 12/13/14/15px choices. `tabular` forces fixed-width digits so
// money/quantity columns line up when scanning a list.
export const type: Record<string, TextStyle> = {
  display: { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  h1: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
  h2: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  bodySm: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  micro: { fontSize: 11, fontWeight: '500', lineHeight: 13 },
};

export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };
