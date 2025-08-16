import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

interface RatingStarsProps {
  rating: number;
  size?: number;
  maxStars?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 16,
  maxStars = 5
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <MaterialCommunityIcons
          key={`full-${index}`}
          name="star"
          size={size}
          color={colors.star}
        />
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <MaterialCommunityIcons
          name="star-half-full"
          size={size}
          color={colors.star}
        />
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <MaterialCommunityIcons
          key={`empty-${index}`}
          name="star-outline"
          size={size}
          color={colors.textSecondary}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RatingStars;
