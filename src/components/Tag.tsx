import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface TagProps {
  text: string;
  variant?: 'default' | 'primary' | 'success';
}

const Tag: React.FC<TagProps> = ({ text, variant = 'default' }) => {
  const getTagStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'success':
        return { color: colors.white };
      default:
        return { color: colors.textSecondary };
    }
  };

  return (
    <View style={[styles.container, getTagStyle()]}>
      <Text style={[styles.text, getTextStyle()]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Tag;
