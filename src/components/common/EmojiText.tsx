import React from 'react';
import { Platform, StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { emoji, type EmojiSize } from '../../constants/themes/themes';

/**
 * iOS must use Apple Color Emoji explicitly — otherwise Nunito (from parent Text
 * or expo-font) wins and emoji render as □?. Android falls back automatically.
 */
const EMOJI_FONT: TextStyle =
  Platform.OS === 'ios' ? { fontFamily: 'Apple Color Emoji' } : {};

function emojiStyle(size: EmojiSize, style?: StyleProp<TextStyle>): StyleProp<TextStyle> {
  return [EMOJI_FONT, emoji[size], style];
}

type EmojiTextProps = TextProps & {
  size?: EmojiSize;
  children: string;
};

/** Standalone emoji — system emoji font, safe on iOS and Android. */
export function EmojiText({ size = 'md', style, children, ...props }: EmojiTextProps) {
  return (
    <Text style={emojiStyle(size, style)} {...props}>
      {children}
    </Text>
  );
}

type TextWithLeadingEmojiProps = TextProps & {
  emojiChar: string;
  emojiSize?: EmojiSize;
  textStyle: StyleProp<TextStyle>;
  children: string;
};

/** Leading emoji + label; emoji and text use separate fonts. */
export function TextWithLeadingEmoji({
  emojiChar,
  emojiSize = 'sm',
  textStyle,
  style,
  children,
  ...props
}: TextWithLeadingEmojiProps) {
  return (
    <Text style={style} {...props}>
      <Text style={emojiStyle(emojiSize)}>{emojiChar}</Text>
      {'  '}
      <Text style={textStyle}>{children}</Text>
    </Text>
  );
}

type EmojiPrefixTextProps = TextProps & {
  emojiChar: string;
  emojiSize?: EmojiSize;
  textStyle: StyleProp<TextStyle>;
  children: string;
};

/** Emoji immediately before text (e.g. CTA buttons). */
export function EmojiPrefixText({
  emojiChar,
  emojiSize = 'sm',
  textStyle,
  style,
  children,
  ...props
}: EmojiPrefixTextProps) {
  return (
    <Text style={style} {...props}>
      <Text style={emojiStyle(emojiSize)}>{emojiChar}</Text>
      <Text style={textStyle}>{` ${children}`}</Text>
    </Text>
  );
}
