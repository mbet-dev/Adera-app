import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export interface ProfileAvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  onPress?: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ uri, name, size = 56, onPress }) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const fontSize = Math.max(12, Math.min(size * 0.4, 22)); // Responsive font size
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      {uri ? (
        <Image source={{ uri }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#E63946' }]}> 
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1FAEE',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 