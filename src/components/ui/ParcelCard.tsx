import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from './Card';

export interface ParcelCardProps {
  trackingNumber: string;
  status: 'delivered' | 'in_transit' | 'pending' | 'cancelled';
  recipient: string;
  deliveryAddress: string;
  amount: number;
  date: string;
  statusConfig: Record<string, { color: string; icon: string; label: string }>;
  onPress?: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({
  trackingNumber,
  status,
  recipient,
  deliveryAddress,
  amount,
  date,
  statusConfig,
  onPress,
  compact = false,
  style,
}) => {
  const statusObj = statusConfig[status];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
      <Card padding={compact ? 'small' : 'medium'} shadow={compact ? 'small' : 'medium'} borderRadius="medium">
        <View style={styles.header}>
          <Text style={styles.trackingNumber}>{trackingNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusObj.color }]}> 
            <Icon name={statusObj.icon} size={compact ? 12 : 16} color="#fff" />
            <Text style={styles.statusText}>{statusObj.label}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.infoRow}>
            <Icon name="account" size={compact ? 12 : 14} color="#888" />
            <Text style={styles.infoText} numberOfLines={1}>{recipient}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={compact ? 12 : 14} color="#888" />
            <Text style={styles.infoText} numberOfLines={1}>{deliveryAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="currency-eth" size={compact ? 12 : 14} color="#888" />
            <Text style={styles.infoText}>{amount.toFixed(2)} ETB</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trackingNumber: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  body: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 13,
    flex: 1,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 11,
    color: '#888',
  },
}); 