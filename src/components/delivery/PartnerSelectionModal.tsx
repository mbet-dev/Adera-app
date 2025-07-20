import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Partner } from '../../types';
import { Image } from 'react-native';

interface PartnerSelectionModalProps {
  visible: boolean;
  partners: Partner[];
  loading: boolean;
  onClose: () => void;
  onSelect: (partner: Partner) => void;
}

export function PartnerSelectionModal({
  visible,
  partners,
  loading,
  onClose,
  onSelect,
}: PartnerSelectionModalProps) {
  const theme = useTheme();
  const [search, setSearch] = React.useState('');

  const filteredPartners = React.useMemo(() => {
    if (!search) {
      return partners;
    }
    return partners.filter(p =>
      p.business_name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
    );
  }, [partners, search]);

  const handleSelect = (partner: Partner) => {
    onSelect(partner);
  };

  const renderItem = ({ item }: { item: Partner }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item)}>
      <Image
        source={item.photo_url ? { uri: item.photo_url } : require('../../../assets/icon.png')}
        style={styles.itemImage}
      />
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemName, { color: theme.colors.text }]}>
          {item.business_name}
        </Text>
        <Text style={[styles.itemLocation, { color: theme.colors.text + '90' }]}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.modalBackground }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Select a Partner</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchSection}>
            <TextInput
              style={[
                styles.searchInput,
                { color: theme.colors.text, borderColor: theme.colors.border }
              ]}
              placeholder="Search by name or location..."
              placeholderTextColor={theme.colors.placeholder}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={filteredPartners}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>No partners found.</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemLocation: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
  },
}); 