import { 
  PaymentMethod, 
  PaymentStatus, 
  PaymentRequest, 
  PaymentResponse
} from '../../types';
import { ApiService, ApiResponse } from './ApiService';

// Payment Gateway Configuration
interface PaymentGatewayConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  timeout: number;
}

// Payment Gateway Response
interface GatewayResponse {
  success: boolean;
  transactionId?: string;
  reference?: string;
  message?: string;
  error?: string;
  data?: any;
}

// Payment Gateway Interface
interface PaymentGateway {
  name: string;
  config: PaymentGatewayConfig;
  processPayment(request: PaymentRequest): Promise<GatewayResponse>;
  verifyPayment(transactionId: string): Promise<GatewayResponse>;
  refundPayment(transactionId: string, amount: number): Promise<GatewayResponse>;
}

// =====================================================
// TELEBIRR PAYMENT GATEWAY
// =====================================================

export class TelebirrGateway implements PaymentGateway {
  name = 'Telebirr';
  config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  async processPayment(request: PaymentRequest): Promise<GatewayResponse> {
    try {
      console.log('Telebirr: Processing payment for amount:', request.amount);

      // Simulate Telebirr API call
      const response = await fetch(`${this.config.baseUrl}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: 'ETB',
          reference: `ADERA_${Date.now()}`,
          description: `Adera delivery payment - ${request.parcel_id || 'Order'}`,
          callback_url: `${this.config.baseUrl}/payment/callback`,
          return_url: `${this.config.baseUrl}/payment/return`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telebirr API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.success || false,
        transactionId: data.transaction_id,
        reference: data.reference,
        message: data.message || 'Payment initiated successfully',
        data: data
      };
    } catch (error: any) {
      console.error('Telebirr payment error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<GatewayResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payment/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Telebirr verification error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.success || false,
        transactionId: data.transaction_id,
        message: data.message || 'Payment verified',
        data: data
      };
    } catch (error: any) {
      console.error('Telebirr verification error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<GatewayResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          amount: amount,
          reason: 'Customer request',
        }),
      });

      if (!response.ok) {
        throw new Error(`Telebirr refund error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.success || false,
        transactionId: data.refund_id,
        message: data.message || 'Refund processed successfully',
        data: data
      };
    } catch (error: any) {
      console.error('Telebirr refund error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }
}

// =====================================================
// CHAPA PAYMENT GATEWAY
// =====================================================

export class ChapaGateway implements PaymentGateway {
  name = 'Chapa';
  config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  async processPayment(request: PaymentRequest): Promise<GatewayResponse> {
    try {
      console.log('Chapa: Processing payment for amount:', request.amount);

      const response = await fetch(`${this.config.baseUrl}/v1/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: 'ETB',
          email: 'customer@adera.com', // Should come from user profile
          first_name: 'Customer',
          last_name: 'Adera',
          tx_ref: `ADERA_${Date.now()}`,
          callback_url: `${this.config.baseUrl}/payment/callback`,
          return_url: `${this.config.baseUrl}/payment/return`,
          customizations: {
            title: 'Adera Delivery Payment',
            description: `Payment for delivery - ${request.parcel_id || 'Order'}`,
            logo: 'https://adera.com/logo.png',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Chapa API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.status === 'success',
        transactionId: data.data?.reference,
        reference: data.data?.tx_ref,
        message: data.message || 'Payment initiated successfully',
        data: data
      };
    } catch (error: any) {
      console.error('Chapa payment error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<GatewayResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/transaction/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Chapa verification error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.status === 'success',
        transactionId: data.data?.reference,
        message: data.message || 'Payment verified',
        data: data
      };
    } catch (error: any) {
      console.error('Chapa verification error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<GatewayResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          transaction_reference: transactionId,
          amount: amount,
          reason: 'Customer request',
        }),
      });

      if (!response.ok) {
        throw new Error(`Chapa refund error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.status === 'success',
        transactionId: data.data?.refund_reference,
        message: data.message || 'Refund processed successfully',
        data: data
      };
    } catch (error: any) {
      console.error('Chapa refund error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }
}

// =====================================================
// ARIFPAY PAYMENT GATEWAY
// =====================================================

export class ArifPayGateway implements PaymentGateway {
  name = 'ArifPay';
  config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  async processPayment(request: PaymentRequest): Promise<GatewayResponse> {
    try {
      console.log('ArifPay: Processing payment for amount:', request.amount);

      const response = await fetch(`${this.config.baseUrl}/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-arifpay-key': this.config.apiKey,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: 'ETB',
          items: [{
            name: 'Adera Delivery',
            quantity: 1,
            price: request.amount,
            description: `Delivery payment - ${request.parcel_id || 'Order'}`,
          }],
          successUrl: `${this.config.baseUrl}/payment/success`,
          cancelUrl: `${this.config.baseUrl}/payment/cancel`,
          notifyUrl: `${this.config.baseUrl}/payment/notify`,
          expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }),
      });

      if (!response.ok) {
        throw new Error(`ArifPay API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.success || false,
        transactionId: data.sessionId,
        reference: data.paymentId,
        message: data.message || 'Payment initiated successfully',
        data: data
      };
    } catch (error: any) {
      console.error('ArifPay payment error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<GatewayResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/checkout/session/${transactionId}`, {
        method: 'GET',
        headers: {
          'x-arifpay-key': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ArifPay verification error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.status === 'paid',
        transactionId: data.sessionId,
        message: data.message || 'Payment verified',
        data: data
      };
    } catch (error: any) {
      console.error('ArifPay verification error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<GatewayResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-arifpay-key': this.config.apiKey,
        },
        body: JSON.stringify({
          sessionId: transactionId,
          amount: amount,
          reason: 'Customer request',
        }),
      });

      if (!response.ok) {
        throw new Error(`ArifPay refund error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.success || false,
        transactionId: data.refundId,
        message: data.message || 'Refund processed successfully',
        data: data
      };
    } catch (error: any) {
      console.error('ArifPay refund error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }
}

// =====================================================
// MAIN PAYMENT SERVICE
// =====================================================

export class PaymentService {
  private static gateways: Map<PaymentMethod, PaymentGateway> = new Map();

  // Initialize payment gateways
  static initializeGateways(configs: {
    telebirr?: PaymentGatewayConfig;
    chapa?: PaymentGatewayConfig;
    arifpay?: PaymentGatewayConfig;
  }) {
    if (configs.telebirr) {
      this.gateways.set(PaymentMethod.TELEBIRR, new TelebirrGateway(configs.telebirr));
    }
    if (configs.chapa) {
      this.gateways.set(PaymentMethod.CHAPA, new ChapaGateway(configs.chapa));
    }
    if (configs.arifpay) {
      this.gateways.set(PaymentMethod.ARIFPAY, new ArifPayGateway(configs.arifpay));
    }
  }

  // Process payment through appropriate gateway
  static async processPayment(request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      console.log('PaymentService: Processing payment with method:', request.payment_method);

      // Handle wallet payments internally
      if (request.payment_method === PaymentMethod.WALLET) {
        return await this.processWalletPayment(request);
      }

      // Handle cash on delivery
      if (request.payment_method === PaymentMethod.CASH_ON_DELIVERY) {
        return await this.processCashOnDelivery(request);
      }

      // Get appropriate gateway
      const gateway = this.gateways.get(request.payment_method);
      if (!gateway) {
        throw new Error(`Payment gateway not configured for method: ${request.payment_method}`);
      }

      // Process payment through gateway
      const gatewayResponse = await gateway.processPayment(request);

      if (!gatewayResponse.success) {
        throw new Error(gatewayResponse.error || 'Payment processing failed');
      }

      // Create transaction record
      const transactionData = {
        parcel_id: request.parcel_id,
        user_id: request.user_id,
        amount: request.amount,
        payment_method: request.payment_method,
        payment_status: PaymentStatus.PROCESSING,
        gateway_transaction_id: gatewayResponse.transactionId,
        gateway_response: gatewayResponse.data,
        commission_amount: this.calculateCommission(request.amount),
        partner_commission: this.calculatePartnerCommission(request.amount),
        driver_commission: this.calculateDriverCommission(request.amount),
        created_at: new Date().toISOString(),
      };

      const transactionResponse = await ApiService.addTransaction(transactionData);

      if (!transactionResponse.success) {
        throw new Error('Failed to create transaction record');
      }

      return {
        data: {
          success: true,
          transaction_id: transactionResponse.data?.id,
          gateway_transaction_id: gatewayResponse.transactionId,
          message: gatewayResponse.message || 'Payment processed successfully',
        },
        error: null,
        success: true,
      };
    } catch (error: any) {
      console.error('PaymentService error:', error.message || 'Unknown error');
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        success: false,
      };
    }
  }

  // Verify payment status
  static async verifyPayment(
    transactionId: string, 
    paymentMethod: PaymentMethod
  ): Promise<ApiResponse<PaymentResponse>> {
    try {
      const gateway = this.gateways.get(paymentMethod);
      if (!gateway) {
        throw new Error(`Payment gateway not configured for method: ${paymentMethod}`);
      }

      const gatewayResponse = await gateway.verifyPayment(transactionId);

      if (!gatewayResponse.success) {
        throw new Error(gatewayResponse.error || 'Payment verification failed');
      }

      // Update transaction status
      // This would typically update the transaction record in the database
      // For now, we'll return the verification result

      return {
        data: {
          success: true,
          transaction_id: transactionId,
          gateway_transaction_id: gatewayResponse.transactionId,
          message: gatewayResponse.message || 'Payment verified successfully',
        },
        error: null,
        success: true,
      };
    } catch (error: any) {
      console.error('PaymentService verification error:', error.message || 'Unknown error');
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Payment verification failed',
        success: false,
      };
    }
  }

  // Process wallet payment
  private static async processWalletPayment(request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      // Get current wallet balance
      const balanceResponse = await ApiService.getWalletBalance(request.user_id);
      if (!balanceResponse.success) {
        throw new Error('Failed to get wallet balance');
      }

      const currentBalance = balanceResponse.data || 0;

      if (currentBalance < request.amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct amount from wallet
      const newBalance = currentBalance - request.amount;
      const updateResponse = await ApiService.updateWalletBalance(request.user_id, newBalance);

      if (!updateResponse.success) {
        throw new Error('Failed to update wallet balance');
      }

      // Create transaction record
      const transactionData = {
        parcel_id: request.parcel_id,
        user_id: request.user_id,
        amount: request.amount,
        payment_method: PaymentMethod.WALLET,
        payment_status: PaymentStatus.COMPLETED,
        commission_amount: this.calculateCommission(request.amount),
        partner_commission: this.calculatePartnerCommission(request.amount),
        driver_commission: this.calculateDriverCommission(request.amount),
        created_at: new Date().toISOString(),
      };

      const transactionResponse = await ApiService.addTransaction(transactionData);

      if (!transactionResponse.success) {
        throw new Error('Failed to create transaction record');
      }

      return {
        data: {
          success: true,
          transaction_id: transactionResponse.data?.id,
          message: 'Wallet payment processed successfully',
        },
        error: null,
        success: true,
      };
    } catch (error: any) {
      console.error('Wallet payment error:', error.message || 'Unknown error');
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Wallet payment failed',
        success: false,
      };
    }
  }

  // Process cash on delivery
  private static async processCashOnDelivery(request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      // Create transaction record with pending status
      const transactionData = {
        parcel_id: request.parcel_id,
        user_id: request.user_id,
        amount: request.amount,
        payment_method: PaymentMethod.CASH_ON_DELIVERY,
        payment_status: PaymentStatus.PENDING,
        commission_amount: this.calculateCommission(request.amount),
        partner_commission: this.calculatePartnerCommission(request.amount),
        driver_commission: this.calculateDriverCommission(request.amount),
        created_at: new Date().toISOString(),
      };

      const transactionResponse = await ApiService.addTransaction(transactionData);

      if (!transactionResponse.success) {
        throw new Error('Failed to create transaction record');
      }

      return {
        data: {
          success: true,
          transaction_id: transactionResponse.data?.id,
          message: 'Cash on delivery payment recorded successfully',
        },
        error: null,
        success: true,
      };
    } catch (error: any) {
      console.error('Cash on delivery error:', error.message || 'Unknown error');
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Cash on delivery processing failed',
        success: false,
      };
    }
  }

  // Calculate commission (Adera's cut)
  private static calculateCommission(amount: number): number {
    return Math.round(amount * 0.15); // 15% commission
  }

  // Calculate partner commission
  private static calculatePartnerCommission(amount: number): number {
    return Math.round(amount * 0.05); // 5% for partner
  }

  // Calculate driver commission
  private static calculateDriverCommission(amount: number): number {
    return Math.round(amount * 0.10); // 10% for driver
  }

  // Get available payment methods
  static getAvailablePaymentMethods(): PaymentMethod[] {
    return Array.from(this.gateways.keys());
  }

  // Check if payment method is supported
  static isPaymentMethodSupported(method: PaymentMethod): boolean {
    return this.gateways.has(method) || 
           method === PaymentMethod.WALLET || 
           method === PaymentMethod.CASH_ON_DELIVERY;
  }
} 