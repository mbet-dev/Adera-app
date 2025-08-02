import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerStackParamList } from '../../types/navigation';
import { getWalletBalance, updateWalletBalance, getTransactions, addTransaction, processPayment } from '../../services/api';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';

const { width } = Dimensions.get('window');

type WalletNavigationProp = StackNavigationProp<CustomerStackParamList, 'Wallet'>;

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  payment_method: string;
  status: string;
  created_at: string;
}

interface TopUpOption {
  id: string;
  amount: number;
  bonus: number;
  popular?: boolean;
}

export default function WalletScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<WalletNavigationProp>();
  
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const topUpOptions: TopUpOption[] = [
    { id: '1', amount: 100, bonus: 0 },
    { id: '2', amount: 500, bonus: 25, popular: true },
    { id: '3', amount: 1000, bonus: 100 },
    { id: '4', amount: 2000, bonus: 250 },
    { id: '5', amount: 5000, bonus: 750 },
    { id: '6', amount: 10000, bonus: 2000 },
  ];

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchWalletBalance(),
        fetchTransactions()
      ]);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      if (!user?.id) return;
      const balance = await getWalletBalance(user.id);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Keep current balance if fetch fails
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user?.id) return;
      const transactionData = await getTransactions(user.id, 10);
      setTransactions(transactionData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const handleTopUp = (amount: number) => {
    setSelectedTopUpAmount(amount);
    setShowTopUpModal(true);
  };

  const handleCustomTopUp = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setSelectedTopUpAmount(amount);
    setShowTopUpModal(true);
  };

  const processTopUp = async (paymentMethod: string) => {
    try {
      setProcessingPayment(true);

      // Process payment through API service
      const paymentResult = await processPayment({
        amount: selectedTopUpAmount,
        paymentMethod,
        userId: user?.id
      });

      if (paymentResult.success) {
        // Update wallet balance
        const newBalance = walletBalance + selectedTopUpAmount;
        await updateWalletBalance(user?.id || '', newBalance);
        setWalletBalance(newBalance);

        // Add transaction record
        await addTransaction({
          user_id: user?.id || '',
          amount: selectedTopUpAmount,
          payment_method: paymentMethod,
          payment_status: 'completed',
          type: 'credit',
          description: `Top up via ${paymentMethod}`,
          created_at: new Date().toISOString()
        });

        Alert.alert(
          'Payment Successful',
          `Your wallet has been topped up with ${formatPrice(selectedTopUpAmount)}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowTopUpModal(false);
                setSelectedTopUpAmount(0);
                setProcessingPayment(false);
              }
            }
          ]
        );
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Error processing top up:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (amount: number): string => {
    return `ETB ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string): keyof typeof Feather.glyphMap => {
    return type === 'credit' ? 'plus-circle' : 'minus-circle';
  };

  const getTransactionColor = (type: string): string => {
    return type === 'credit' ? '#2ECC71' : '#E74C3C';
  };

  if (loading) {
    return (
      <ScreenLayout>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#1D3557', '#2C3E50']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.headerTitle}>Wallet</Text>
                  <Text style={styles.headerSubtitle}>Manage your balance and transactions</Text>
                </View>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => navigation.navigate('Settings' as any)}
                >
                  <Feather name="settings" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceSection}>
            <Card style={{ ...styles.balanceCard, backgroundColor: colors.card }}>
              <LinearGradient
                colors={['#2ECC71', '#27AE60']}
                style={styles.balanceGradient}
              >
                <View style={styles.balanceContent}>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Current Balance</Text>
                    <Text style={styles.balanceAmount}>
                      {formatPrice(walletBalance)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.topUpButton}
                    onPress={() => setShowTopUpModal(true)}
                  >
                    <Feather name="plus" size={20} color="#FFFFFF" />
                    <Text style={styles.topUpText}>Top Up</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Card>
          </View>

          {/* Top Up Options */}
          <View style={styles.topUpSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Top Up
            </Text>
            <View style={styles.topUpGrid}>
              {topUpOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.topUpOption,
                    { backgroundColor: colors.card },
                    option.popular && styles.popularOption
                  ]}
                  onPress={() => handleTopUp(option.amount)}
                >
                  {option.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                  <Text style={[styles.topUpAmount, { color: colors.text }]}>
                    {formatPrice(option.amount)}
                  </Text>
                  {option.bonus > 0 && (
                    <Text style={[styles.bonusText, { color: colors.textSecondary }]}>
                      +{formatPrice(option.bonus)} bonus
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View style={styles.customAmountSection}>
            <Card style={{ backgroundColor: colors.card }}>
              <View style={styles.customAmountCard}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Custom Amount
                </Text>
                <View style={styles.customAmountContent}>
                  <TextInput
                    style={[
                      styles.amountInput,
                      { 
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.background
                      }
                    ]}
                    placeholder="Enter amount"
                    placeholderTextColor={colors.placeholder}
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    keyboardType="numeric"
                  />
                  <Button
                    title="Top Up"
                    onPress={handleCustomTopUp}
                    style={styles.customTopUpButton}
                    disabled={!customAmount || processingPayment}
                  />
                </View>
              </View>
            </Card>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Transactions
              </Text>
              <TouchableOpacity>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            {transactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {transactions.map((transaction) => (
                  <Card key={transaction.id} style={{ backgroundColor: colors.card }}>
                    <View style={styles.transactionCard}>
                      <View style={styles.transactionContent}>
                        <View style={styles.transactionIcon}>
                          <Feather 
                            name={getTransactionIcon(transaction.type)} 
                            size={20} 
                            color={getTransactionColor(transaction.type)} 
                          />
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text style={[styles.transactionDescription, { color: colors.text }]}>
                            {transaction.description}
                          </Text>
                          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                            {formatDate(transaction.created_at)}
                          </Text>
                        </View>
                        <View style={styles.transactionAmount}>
                          <Text style={[
                            styles.transactionAmountText,
                            { color: transaction.type === 'credit' ? '#2ECC71' : '#E74C3C' }
                          ]}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatPrice(transaction.amount)}
                          </Text>
                          <Text style={[styles.transactionStatus, { color: colors.textSecondary }]}>
                            {transaction.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <View style={styles.emptyTransactions}>
                <Feather name="credit-card" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No transactions yet
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Your transaction history will appear here
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Top Up Modal */}
        <Modal
          visible={showTopUpModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTopUpModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Top Up Wallet
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowTopUpModal(false)}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={[styles.modalAmount, { color: colors.text }]}>
                  {formatPrice(selectedTopUpAmount)}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Choose your payment method
                </Text>
                
                <View style={styles.paymentMethods}>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethod,
                      { 
                        borderColor: colors.border,
                        backgroundColor: colors.background
                      }
                    ]}
                    onPress={() => processTopUp('telebirr')}
                    disabled={processingPayment}
                  >
                    <Feather name="smartphone" size={24} color="#2ECC71" />
                    <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                      Telebirr
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentMethod,
                      { 
                        borderColor: colors.border,
                        backgroundColor: colors.background
                      }
                    ]}
                    onPress={() => processTopUp('chapa')}
                    disabled={processingPayment}
                  >
                    <Feather name="credit-card" size={24} color="#3498DB" />
                    <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                      Chapa
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentMethod,
                      { 
                        borderColor: colors.border,
                        backgroundColor: colors.background
                      }
                    ]}
                    onPress={() => processTopUp('arifpay')}
                    disabled={processingPayment}
                  >
                    <Feather name="credit-card" size={24} color="#9B59B6" />
                    <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                      ArifPay
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {processingPayment && (
                  <View style={styles.processingContainer}>
                    <LoadingIndicator />
                    <Text style={[styles.processingText, { color: colors.textSecondary }]}>
                      Processing payment...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  balanceCard: {
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 24,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  topUpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  topUpSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  topUpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topUpOption: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  popularOption: {
    borderWidth: 2,
    borderColor: '#E63946',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E63946',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  topUpAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bonusText: {
    fontSize: 12,
  },
  customAmountSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  customAmountCard: {
    padding: 20,
  },
  customAmountContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 12,
  },
  customTopUpButton: {
    backgroundColor: '#E63946',
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    padding: 16,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  paymentMethods: {
    width: '100%',
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  processingText: {
    fontSize: 14,
    marginTop: 8,
  },
}); 