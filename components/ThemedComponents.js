import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export const ThemedView = ({ style, children, ...props }) => {
  const { colors } = useAppTheme();
  return (
    <View style={[{ backgroundColor: colors.background }, style]} {...props}>
      {children}
    </View>
  );
};

export const ThemedText = ({ style, children, secondary, ...props }) => {
  const { colors } = useAppTheme();
  const textColor = secondary ? colors.textSecondary : colors.text;
  
  return (
    <Text style={[{ color: textColor }, style]} {...props}>
      {children}
    </Text>
  );
};

export const ThemedCard = ({ style, children, ...props }) => {
  const { colors } = useAppTheme();
  return (
    <View 
      style={[
        { 
          backgroundColor: colors.cardBg,
          borderRadius: 12,
          padding: 16,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

export const ThemedInput = ({ style, ...props }) => {
  const { colors } = useAppTheme();
  return (
    <TextInput
      style={[
        {
          backgroundColor: colors.inputBg,
          color: colors.text,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
        },
        style
      ]}
      placeholderTextColor={colors.textSecondary}
      {...props}
    />
  );
};