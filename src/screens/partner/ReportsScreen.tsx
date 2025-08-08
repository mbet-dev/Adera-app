import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { ApiService } from '../../services/core';
import { ParcelStatus } from '../../types';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    totalParcels: number;
    totalEarnings: number;
    avgDeliveryTime: number;
    successRate: number;
  };
  parcelsByStatus: {
    status: ParcelStatus;
    count: number;
    percentage: number;
  }[];
  earningsOverTime: {
    date: string;
    amount: number;
    parcelsCount: number;
  }[];
  shopAnalytics?: {
    totalOrders: number;
    totalRevenue: number;
    topProducts: {
      name: string;
      orders: number;
      revenue: number;
    }[];
    avgOrderValue: number;
  };
}

interface ReportCard {
  id: string;
  title: string;
  icon: string;
  color: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
}

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [hasShop, setHasShop] = useState(false);
  
  const periods = [
    { key: 'week', label: '7 Days' },
    { key: 'month', label: '30 Days' },
    { key: 'quarter', label: '3 Months' },
    { key: 'year', label: '1 Year' }
  ];
  
  useEffect(() => {
    loadAnalytics();
    checkShopStatus();
  }, [selectedPeriod]);
  
  const checkShopStatus = async () => {
    if (!user?.id) return;
    
    try {
      const shopResponse = await ApiService.getShopByPartnerId(user.id);
      setHasShop(shopResponse.success && !!shopResponse.data);
    } catch (error) {
      console.error('Error checking shop status:', error);
      setHasShop(false);
    }
  };
  
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Load partner delivery analytics
      const deliveryResponse = await ApiService.getPartnerAnalytics(user.id, selectedPeriod);
      if (!deliveryResponse.success) {
        throw new Error(deliveryResponse.error || 'Failed to load analytics');
      }
      
      let analyticsData: AnalyticsData = deliveryResponse.data;
      
      // Load shop analytics if partner has a shop
      if (hasShop) {
        const shopResponse = await ApiService.getShopByPartnerId(user.id);
        if (shopResponse.success && shopResponse.data) {
          const shopAnalyticsResponse = await ApiService.getShopAnalytics(shopResponse.data.id, selectedPeriod);
          if (shopAnalyticsResponse.success) {
            analyticsData.shopAnalytics = shopAnalyticsResponse.data;
          }
        }
      }
      
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };
  
  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString()}`;
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  const getStatusColor = (status: ParcelStatus) => {
    switch (status) {
      case ParcelStatus.DELIVERED:
        return colors.success;
      case ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB:
      case ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT:
        return colors.warning;
      case ParcelStatus.CREATED:
      case ParcelStatus.FACILITY_RECEIVED:
        return colors.primary;
      default:
        return colors.text;
    }
  };
  
  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'neutral':
      default:
        return 'trending-neutral';
    }
  };
  
  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      case 'neutral':
      default:
        return colors.textSecondary;
    }
  };
  
  const generateReportCards = (): ReportCard[] => {
    if (!analytics) return [];
    
    const cards: ReportCard[] = [
      {
        id: 'total-parcels',
        title: 'Total Parcels',
        icon: 'package-variant',
        color: colors.primary,
        value: analytics.overview.totalParcels,
        subtitle: `${selectedPeriod === 'week' ? 'This week' : selectedPeriod === 'month' ? 'This month' : selectedPeriod === 'quarter' ? 'Last 3 months' : 'This year'}`,
        trend: {
          direction: 'up',
          percentage: 12.5
        }
      },
      {
        id: 'total-earnings',
        title: 'Total Earnings',
        icon: 'currency-usd',
        color: colors.success,
        value: formatCurrency(analytics.overview.totalEarnings),
        subtitle: 'From deliveries',
        trend: {
          direction: 'up',
          percentage: 8.3
        }
      },
      {
        id: 'avg-delivery-time',
        title: 'Avg Delivery Time',
        icon: 'clock-outline',
        color: colors.warning,
        value: `${analytics.overview.avgDeliveryTime}h`,
        subtitle: 'Average completion time'
      },
      {
        id: 'success-rate',
        title: 'Success Rate',
        icon: 'check-circle',
        color: colors.success,
        value: formatPercentage(analytics.overview.successRate),
        subtitle: 'Successful deliveries'
      }
    ];
    
    if (analytics.shopAnalytics) {
      cards.push(
        {
          id: 'shop-orders',
          title: 'Shop Orders',
          icon: 'shopping',
          color: colors.primary,
          value: analytics.shopAnalytics.totalOrders,
          subtitle: 'Total orders received',
          trend: {
            direction: 'up',
            percentage: 15.7
          }
        },
        {
          id: 'shop-revenue',
          title: 'Shop Revenue',
          icon: 'store',
          color: colors.success,
          value: formatCurrency(analytics.shopAnalytics.totalRevenue),
          subtitle: 'From shop sales',
          trend: {
            direction: 'up',
            percentage: 22.1
          }
        }
      );
    }
    
    return cards;
  };
  
  const renderReportCard = (card: ReportCard) => (
    <Card key={card.id} style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: card.color + '20' }]}>
          <Icon name={card.icon} size={24} color={card.color} />
        </View>
        {card.trend && (
          <View style={styles.trendContainer}>
            <Icon 
              name={getTrendIcon(card.trend.direction)} 
              size={16} 
              color={getTrendColor(card.trend.direction)} 
            />
            <Text style={[styles.trendText, { color: getTrendColor(card.trend.direction) }]}>
              {card.trend.percentage}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.cardValue, { color: colors.text }]}>
        {card.value}
      </Text>
      
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        {card.title}
      </Text>
      
      {card.subtitle && (
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {card.subtitle}
        </Text>
      )}
    </Card>
  );
  
  const renderPeriodSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.periodSelector}
      contentContainerStyle={styles.periodContainer}
    >
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodChip,
            {
              backgroundColor: selectedPeriod === period.key ? colors.primary : colors.card,
              borderColor: colors.border
            }
          ]}
          onPress={() => setSelectedPeriod(period.key as any)}
        >
          <Text style={[
            styles.periodText,
            {
              color: selectedPeriod === period.key ? '#FFFFFF' : colors.text
            }
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  const renderParcelStatusChart = () => {
    if (!analytics?.parcelsByStatus.length) return null;
    
    return (
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Parcel Status Distribution
        </Text>
        
        <View style={styles.statusChart}>
          {analytics.parcelsByStatus.map((item, index) => (
            <View key={item.status} style={styles.statusItem}>
              <View style={styles.statusInfo}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <View style={styles.statusDetails}>
                  <Text style={[styles.statusLabel, { color: colors.text }]}>
                    {item.status.replace(/_/g, ' ').toLowerCase()}
                  </Text>
                  <Text style={[styles.statusCount, { color: colors.textSecondary }]}>
                    {item.count} parcels
                  </Text>
                </View>
              </View>
              <Text style={[styles.statusPercentage, { color: colors.text }]}>
                {formatPercentage(item.percentage)}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };
  
  const renderTopProducts = () => {
    if (!analytics?.shopAnalytics?.topProducts?.length) return null;
    
    return (
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Top Selling Products
        </Text>
        
        <View style={styles.productsChart}>
          {analytics.shopAnalytics.topProducts.slice(0, 5).map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productRank}>
                <Text style={[styles.rankNumber, { color: colors.primary }]}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]}>
                  {product.name}
                </Text>
                <Text style={[styles.productStats, { color: colors.textSecondary }]}>
                  {product.orders} orders • {formatCurrency(product.revenue)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading analytics...
          </Text>
        </View>
      </ScreenLayout>
    );
  }
  
  if (error) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <Button
            title="Try Again"
            onPress={loadAnalytics}
            style={styles.retryButton}
          />
        </View>
      </ScreenLayout>
    );
  }
  
  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Reports & Analytics</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Performance insights and statistics
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.exportButton, { borderColor: colors.border }]}
            onPress={() => Alert.alert('Export', 'Export functionality coming soon!')}
          >
            <Icon name="download" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Period Selector */}
        {renderPeriodSelector()}
        
        {/* Report Cards Grid */}
        <View style={styles.cardsGrid}>
          {generateReportCards().map(renderReportCard)}
        </View>
        
        {/* Charts Section */}
        <View style={styles.chartsSection}>
          {renderParcelStatusChart()}
          {renderTopProducts()}
        </View>
        
        {/* Additional Analytics */}
        {analytics && (
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Performance Summary
            </Text>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Delivery Efficiency
                </Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  {formatPercentage(analytics.overview.successRate)}
                </Text>
              </View>
              
              {analytics.shopAnalytics && (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Avg Order Value
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {formatCurrency(analytics.shopAnalytics.avgOrderValue)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.summaryFooter}>
              <Text style={[styles.summaryNote, { color: colors.textSecondary }]}>
                Data updated in real-time • Last updated just now
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  periodSelector: {
    marginBottom: 20,
  },
  periodContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reportCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  chartsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartCard: {
    marginBottom: 16,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusChart: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusDetails: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusCount: {
    fontSize: 14,
    marginTop: 2,
  },
  statusPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  productsChart: {
    gap: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  productStats: {
    fontSize: 14,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  summaryNote: {
    fontSize: 12,
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
});
