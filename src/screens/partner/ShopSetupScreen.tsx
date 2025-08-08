import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Image,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PartnerStackParamList } from '../../types/navigation';
import { ApiService } from '../../services/core';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

type SetupStep = 'basic' | 'details' | 'products' | 'review' | 'success';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  in_stock: boolean;
  stock_quantity: number;
}

interface ShopFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
  business_hours: {
    open_time: string;
    close_time: string;
    days_open: string[];
  };
  logo_url?: string;
  banner_url?: string;
  products: Product[];
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  min_order_amount: number;
  delivery_fee: number;
  delivery_radius_km: number;
  accepts_cash: boolean;
  accepts_digital: boolean;
}

const SHOP_CATEGORIES = [
  { id: 'grocery', name: 'Grocery & Convenience', icon: 'shopping' },
  { id: 'restaurant', name: 'Food & Restaurant', icon: 'food' },
  { id: 'pharmacy', name: 'Pharmacy & Health', icon: 'medical-bag' },
  { id: 'electronics', name: 'Electronics', icon: 'cellphone' },
  { id: 'fashion', name: 'Fashion & Clothing', icon: 'tshirt-crew' },
  { id: 'home', name: 'Home & Garden', icon: 'home' },
  { id: 'books', name: 'Books & Stationery', icon: 'book-open' },
  { id: 'other', name: 'Other', icon: 'store' }
];

const DAYS_OF_WEEK = [
  { id: 'monday', name: 'Mon', fullName: 'Monday' },
  { id: 'tuesday', name: 'Tue', fullName: 'Tuesday' },
  { id: 'wednesday', name: 'Wed', fullName: 'Wednesday' },
  { id: 'thursday', name: 'Thu', fullName: 'Thursday' },
  { id: 'friday', name: 'Fri', fullName: 'Friday' },
  { id: 'saturday', name: 'Sat', fullName: 'Saturday' },
  { id: 'sunday', name: 'Sun', fullName: 'Sunday' }
];

export default function ShopSetupScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<PartnerStackParamList>>();
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    description: '',
    category: '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    address: '',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    postal_code: '',
    business_hours: {
      open_time: '08:00',
      close_time: '20:00',
      days_open: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    products: [],
    delivery_enabled: true,
    pickup_enabled: true,
    min_order_amount: 50,
    delivery_fee: 25,
    delivery_radius_km: 5,
    accepts_cash: true,
    accepts_digital: false
  });

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to upload shop images.'
        );
      }
    }
  };

  const pickImage = async (type: 'logo' | 'banner') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (type === 'logo') {
          setFormData(prev => ({ ...prev, logo_url: imageUri }));
        } else {
          setFormData(prev => ({ ...prev, banner_url: imageUri }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'basic':
        if (!formData.name.trim()) {
          Alert.alert('Validation Error', 'Shop name is required');
          return false;
        }
        if (!formData.category) {
          Alert.alert('Validation Error', 'Please select a shop category');
          return false;
        }
        return true;
        
      case 'details':
        if (!formData.phone.trim()) {
          Alert.alert('Validation Error', 'Phone number is required');
          return false;
        }
        if (!formData.address.trim()) {
          Alert.alert('Validation Error', 'Address is required');
          return false;
        }
        return true;
        
      case 'products':
        // Products step is optional, no strict validation required
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    
    const stepOrder: SetupStep[] = ['basic', 'details', 'products', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const stepOrder: SetupStep[] = ['basic', 'details', 'products', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      setIsSaving(true);

      // Create shop
      const shopData = {
        partner_id: user.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        postal_code: formData.postal_code,
        business_hours: formData.business_hours,
        delivery_enabled: formData.delivery_enabled,
        pickup_enabled: formData.pickup_enabled,
        min_order_amount: formData.min_order_amount,
        delivery_fee: formData.delivery_fee,
        delivery_radius_km: formData.delivery_radius_km,
        accepts_cash: formData.accepts_cash,
        accepts_digital: formData.accepts_digital,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        is_active: true,
        is_approved: false // Admin approval required
      };

      const response = await ApiService.createShop(shopData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create shop');
      }

      setCurrentStep('success');

    } catch (error) {
      console.error('Error creating shop:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create shop. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => `ETB ${amount.toFixed(2)}`;

  const renderProgressBar = () => {
    const steps = ['basic', 'details', 'products', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View style={[
              styles.progressCircle,
              {
                backgroundColor: index <= currentIndex ? colors.primary : colors.border,
              }
            ]}>
              <Text style={[
                styles.progressText,
                { color: index <= currentIndex ? colors.card : colors.textSecondary }
              ]}>
                {index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                {
                  backgroundColor: index < currentIndex ? colors.primary : colors.border,
                }
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderBasicInfoStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Basic Information
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Let's start with the basics about your shop
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Shop Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter your shop name"
            placeholderTextColor={colors.textSecondary}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Tell customers about your shop"
            placeholderTextColor={colors.textSecondary}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Shop Category *</Text>
          <View style={styles.categoryGrid}>
            {SHOP_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: formData.category === category.id ? colors.primary + '20' : colors.card,
                    borderColor: formData.category === category.id ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
              >
                <Icon 
                  name={category.icon} 
                  size={24} 
                  color={formData.category === category.id ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.categoryText,
                  { 
                    color: formData.category === category.id ? colors.primary : colors.text,
                    fontSize: 12
                  }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderDetailsStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Contact & Location
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        How can customers reach you?
      </Text>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="+251911000000"
              placeholderTextColor={colors.textSecondary}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="shop@example.com"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Address *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Street address, building number"
            placeholderTextColor={colors.textSecondary}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>City</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Addis Ababa"
              placeholderTextColor={colors.textSecondary}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Postal Code</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="1000"
              placeholderTextColor={colors.textSecondary}
              value={formData.postal_code}
              onChangeText={(text) => setFormData(prev => ({ ...prev, postal_code: text }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Business Hours</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>Opening Time</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="08:00"
                placeholderTextColor={colors.textSecondary}
                value={formData.business_hours.open_time}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  business_hours: { ...prev.business_hours, open_time: text }
                }))}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>Closing Time</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="20:00"
                placeholderTextColor={colors.textSecondary}
                value={formData.business_hours.close_time}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  business_hours: { ...prev.business_hours, close_time: text }
                }))}
              />
            </View>
          </View>

          <Text style={[styles.sublabel, { color: colors.textSecondary }]}>Days Open</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: formData.business_hours.days_open.includes(day.id) 
                      ? colors.primary + '20' 
                      : colors.card,
                    borderColor: formData.business_hours.days_open.includes(day.id) 
                      ? colors.primary 
                      : colors.border,
                  }
                ]}
                onPress={() => {
                  const daysOpen = formData.business_hours.days_open;
                  const updatedDays = daysOpen.includes(day.id)
                    ? daysOpen.filter(d => d !== day.id)
                    : [...daysOpen, day.id];
                  
                  setFormData(prev => ({
                    ...prev,
                    business_hours: { ...prev.business_hours, days_open: updatedDays }
                  }));
                }}
              >
                <Text style={[
                  styles.dayText,
                  { 
                    color: formData.business_hours.days_open.includes(day.id) 
                      ? colors.primary 
                      : colors.text 
                  }
                ]}>
                  {day.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderProductsStep = () => {
    const addProduct = () => {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: 0,
        category: formData.category || 'other',
        in_stock: true,
        stock_quantity: 0,
      };
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));
    };

    const updateProduct = (id: string, updates: Partial<Product>) => {
      setFormData(prev => ({
        ...prev,
        products: prev.products.map(product => 
          product.id === id ? { ...product, ...updates } : product
        )
      }));
    };

    const removeProduct = (id: string) => {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter(product => product.id !== id)
      }));
    };

    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Add Products
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Add some products to get started (you can add more later)
        </Text>

        <View style={styles.form}>
          {formData.products.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="package-variant" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No Products Added
              </Text>
              <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
                Start by adding your first product to showcase what you offer
              </Text>
            </View>
          ) : (
            formData.products.map((product, index) => (
              <Card key={product.id} style={[styles.productCard, { backgroundColor: colors.card }]}>
                <View style={styles.productHeader}>
                  <Text style={[styles.productIndex, { color: colors.primary }]}>
                    Product {index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeProduct(product.id)}
                    style={styles.removeButton}
                  >
                    <Icon name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Product Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter product name"
                    placeholderTextColor={colors.textSecondary}
                    value={product.name}
                    onChangeText={(text) => updateProduct(product.id, { name: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="Describe your product"
                    placeholderTextColor={colors.textSecondary}
                    value={product.description}
                    onChangeText={(text) => updateProduct(product.id, { description: text })}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { color: colors.text }]}>Price (ETB) *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      value={product.price.toString()}
                      onChangeText={(text) => updateProduct(product.id, { price: parseFloat(text) || 0 })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { color: colors.text }]}>Stock Quantity</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={product.stock_quantity.toString()}
                      onChangeText={(text) => updateProduct(product.id, { stock_quantity: parseInt(text) || 0 })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={[styles.switchLabel, { color: colors.text }]}>In Stock</Text>
                    <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                      Available for customers to order
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.switch, { backgroundColor: product.in_stock ? colors.primary : colors.border }]}
                    onPress={() => updateProduct(product.id, { in_stock: !product.in_stock })}
                  >
                    <View style={[
                      styles.switchThumb, 
                      { 
                        backgroundColor: colors.card,
                        transform: [{ translateX: product.in_stock ? 24 : 0 }]
                      }
                    ]} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          <TouchableOpacity
            style={[styles.addProductButton, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
            onPress={addProduct}
          >
            <Icon name="plus" size={20} color={colors.primary} />
            <Text style={[styles.addProductText, { color: colors.primary }]}>
              Add Product
            </Text>
          </TouchableOpacity>

          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <Icon name="information" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              You can skip this step and add products later from your dashboard.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderPreferencesStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Delivery & Payments
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Set up your delivery options and payment methods
      </Text>

      <View style={styles.form}>
        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Options</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Enable Delivery</Text>
              <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                Deliver orders to customers
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.switch, { backgroundColor: formData.delivery_enabled ? colors.primary : colors.border }]}
              onPress={() => setFormData(prev => ({ ...prev, delivery_enabled: !prev.delivery_enabled }))}
            >
              <View style={[
                styles.switchThumb, 
                { 
                  backgroundColor: colors.card,
                  transform: [{ translateX: formData.delivery_enabled ? 24 : 0 }]
                }
              ]} />
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Enable Pickup</Text>
              <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                Customers can pickup orders
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.switch, { backgroundColor: formData.pickup_enabled ? colors.primary : colors.border }]}
              onPress={() => setFormData(prev => ({ ...prev, pickup_enabled: !prev.pickup_enabled }))}
            >
              <View style={[
                styles.switchThumb, 
                { 
                  backgroundColor: colors.card,
                  transform: [{ translateX: formData.pickup_enabled ? 24 : 0 }]
                }
              ]} />
            </TouchableOpacity>
          </View>

          {formData.delivery_enabled && (
            <>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { color: colors.text }]}>Delivery Fee</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="25.00"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.delivery_fee.toString()}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      delivery_fee: parseFloat(text) || 0 
                    }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { color: colors.text }]}>Delivery Radius (km)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="5"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.delivery_radius_km.toString()}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      delivery_radius_km: parseInt(text) || 0 
                    }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Minimum Order Amount</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="50.00"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.min_order_amount.toString()}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    min_order_amount: parseFloat(text) || 0 
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Methods</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Accept Cash</Text>
              <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                Cash on delivery/pickup
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.switch, { backgroundColor: formData.accepts_cash ? colors.primary : colors.border }]}
              onPress={() => setFormData(prev => ({ ...prev, accepts_cash: !prev.accepts_cash }))}
            >
              <View style={[
                styles.switchThumb, 
                { 
                  backgroundColor: colors.card,
                  transform: [{ translateX: formData.accepts_cash ? 24 : 0 }]
                }
              ]} />
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Accept Digital Payments</Text>
              <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                Telebirr, Chapa, and other digital payments
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.switch, { backgroundColor: formData.accepts_digital ? colors.primary : colors.border }]}
              onPress={() => setFormData(prev => ({ ...prev, accepts_digital: !prev.accepts_digital }))}
            >
              <View style={[
                styles.switchThumb, 
                { 
                  backgroundColor: colors.card,
                  transform: [{ translateX: formData.accepts_digital ? 24 : 0 }]
                }
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Shop Images */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shop Images</Text>
          
          <View style={styles.imageSection}>
            <Text style={[styles.label, { color: colors.text }]}>Logo (Optional)</Text>
            <TouchableOpacity
              style={[styles.imageUpload, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => pickImage('logo')}
            >
              {formData.logo_url ? (
                <Image source={{ uri: formData.logo_url }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Icon name="camera-plus" size={32} color={colors.textSecondary} />
                  <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                    Add Logo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.imageSection}>
            <Text style={[styles.label, { color: colors.text }]}>Banner (Optional)</Text>
            <TouchableOpacity
              style={[styles.bannerUpload, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => pickImage('banner')}
            >
              {formData.banner_url ? (
                <Image source={{ uri: formData.banner_url }} style={styles.uploadedBanner} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Icon name="image-plus" size={32} color={colors.textSecondary} />
                  <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                    Add Banner
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderReviewStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Review & Submit
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Please review your shop information before submitting
      </Text>

      <View style={styles.reviewContainer}>
        {/* Basic Info */}
        <Card style={{ backgroundColor: colors.card, marginBottom: 16, padding: 16 }}>
          <View style={styles.reviewHeader}>
            <Icon name="store" size={20} color={colors.primary} />
            <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
              Basic Information
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Shop Name:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.name}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Category:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {SHOP_CATEGORIES.find(c => c.id === formData.category)?.name || formData.category}
            </Text>
          </View>
          {formData.description && (
            <View style={styles.reviewItem}>
              <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Description:</Text>
              <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.description}</Text>
            </View>
          )}
        </Card>

        {/* Contact Info */}
        <Card style={{ backgroundColor: colors.card, marginBottom: 16, padding: 16 }}>
          <View style={styles.reviewHeader}>
            <Icon name="phone" size={20} color={colors.primary} />
            <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
              Contact & Location
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Phone:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.phone}</Text>
          </View>
          {formData.email && (
            <View style={styles.reviewItem}>
              <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.email}</Text>
            </View>
          )}
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Address:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.address}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>City:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.city}</Text>
          </View>
        </Card>

        {/* Business Hours */}
        <Card style={{ backgroundColor: colors.card, marginBottom: 16, padding: 16 }}>
          <View style={styles.reviewHeader}>
            <Icon name="clock-outline" size={20} color={colors.primary} />
            <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
              Business Hours
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Hours:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {formData.business_hours.open_time} - {formData.business_hours.close_time}
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Days Open:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {formData.business_hours.days_open.map(dayId => 
                DAYS_OF_WEEK.find(d => d.id === dayId)?.name
              ).join(', ')}
            </Text>
          </View>
        </Card>

        {/* Delivery & Payment */}
        <Card style={{ backgroundColor: colors.card, marginBottom: 16, padding: 16 }}>
          <View style={styles.reviewHeader}>
            <Icon name="truck-delivery" size={20} color={colors.primary} />
            <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>
              Delivery & Payment
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Delivery:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {formData.delivery_enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Pickup:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {formData.pickup_enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          {formData.delivery_enabled && (
            <>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Delivery Fee:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {formatCurrency(formData.delivery_fee)}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Min Order:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {formatCurrency(formData.min_order_amount)}
                </Text>
              </View>
            </>
          )}
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Payment Methods:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>
              {[
                formData.accepts_cash && 'Cash',
                formData.accepts_digital && 'Digital'
              ].filter(Boolean).join(', ') || 'None'}
            </Text>
          </View>
        </Card>

        {/* Notice */}
        <Card style={{ backgroundColor: colors.primary + '10', marginBottom: 16, padding: 16 }}>
          <View style={styles.noticeHeader}>
            <Icon name="information" size={20} color={colors.primary} />
            <Text style={[styles.noticeTitle, { color: colors.primary }]}>
              Important Notice
            </Text>
          </View>
          <Text style={[styles.noticeText, { color: colors.text }]}>
            Your shop will be submitted for admin approval. You'll be notified once it's approved and ready to receive orders.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successContent}>
        <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
          <Icon name="check-circle" size={64} color={colors.success} />
        </View>
        
        <Text style={[styles.successTitle, { color: colors.text }]}>
          Shop Created Successfully!
        </Text>
        
        <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
          Your shop "{formData.name}" has been created and submitted for review. 
          Our team will review your application and notify you once it's approved.
        </Text>

        <View style={styles.successActions}>
          <Button
            title="Go to Dashboard"
            onPress={() => navigation.navigate('Home')}
            style={styles.successButton}
          />
          
          <Button
            title="Set Up Products"
            onPress={() => navigation.navigate('Business', { screen: 'Inventory' })}
            style={[styles.successButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
            textStyle={{ color: colors.primary }}
          />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading shop setup...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.container}>
        {currentStep !== 'success' && (
          <>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  if (currentStep === 'basic') {
                    navigation.goBack();
                  } else {
                    previousStep();
                  }
                }}
                style={styles.backButton}
              >
                <Icon name="arrow-left" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Shop Setup
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  Step {['basic', 'details', 'products', 'review'].indexOf(currentStep) + 1} of 4
                </Text>
              </View>
            </View>

            {renderProgressBar()}
          </>
        )}

        <View style={styles.content}>
          {currentStep === 'basic' && renderBasicInfoStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'products' && renderProductsStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </View>

        {currentStep !== 'success' && (
          <View style={styles.footer}>
            {currentStep !== 'basic' && (
              <Button
                title="Previous"
                onPress={previousStep}
                style={[styles.footerButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                textStyle={{ color: colors.text }}
                disabled={isSaving}
              />
            )}
            
            <Button
              title={currentStep === 'review' ? 'Create Shop' : 'Next'}
              onPress={currentStep === 'review' ? handleSubmit : nextStep}
              style={[styles.footerButton, styles.primaryButton, { backgroundColor: colors.primary }]}
              textStyle={{ color: colors.card }}
              disabled={isSaving}
              loading={isSaving}
            />
          </View>
        )}
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  form: {
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 2,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryText: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  switch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageUpload: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerUpload: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  uploadedBanner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  reviewContainer: {
    paddingBottom: 100,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  successButton: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 2,
  },
  // Products step styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  productCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productIndex: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addProductText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
