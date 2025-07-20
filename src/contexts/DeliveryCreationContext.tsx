import React from 'react';
import { Partner } from '../types/index';
import { PaymentMethod } from '../types/database';

export type PackageSize = 'document' | 'small' | 'medium' | 'big';

export interface PackageDetails {
  size: PackageSize;
  weight: number;
  description?: string;
  specialHandling: boolean;
}

export interface RecipientInfo {
  name: string;
  phone: string;
}

export interface DeliveryCreationState {
  currentStep: number;
  termsAccepted: boolean;
  packageDetails: Partial<PackageDetails>;
  recipient: Partial<RecipientInfo>;
  dropoffPoint: Partner | null;
  pickupPoint: Partner | null;
  paymentMethod: PaymentMethod | null;
  trackingCode: string | null;
}

interface DeliveryCreationContextValue {
  state: DeliveryCreationState;
  setCurrentStep: (step: number) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setPackageDetails: (details: Partial<PackageDetails>) => void;
  setRecipient: (info: Partial<RecipientInfo>) => void;
  setDropoffPoint: (partner: Partner | null) => void;
  setPickupPoint: (partner: Partner | null) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setTrackingCode: (code: string | null) => void;
  reset: () => void;
}

const initialState: DeliveryCreationState = {
  currentStep: 0,
  termsAccepted: false,
  packageDetails: {},
  recipient: {},
  dropoffPoint: null,
  pickupPoint: null,
  paymentMethod: null,
  trackingCode: null,
};

const DeliveryCreationContext = React.createContext<DeliveryCreationContextValue | null>(null);

export function DeliveryCreationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<DeliveryCreationState>(initialState);

  const setCurrentStep = React.useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const setTermsAccepted = React.useCallback((accepted: boolean) => {
    setState(prev => ({ ...prev, termsAccepted: accepted }));
  }, []);

  const setPackageDetails = React.useCallback((details: Partial<PackageDetails>) => {
    setState(prev => ({
      ...prev,
      packageDetails: { ...prev.packageDetails, ...details },
    }));
  }, []);

  const setRecipient = React.useCallback((info: Partial<RecipientInfo>) => {
    setState(prev => ({
      ...prev,
      recipient: { ...prev.recipient, ...info },
    }));
  }, []);

  const setDropoffPoint = React.useCallback((partner: Partner | null) => {
    setState(prev => ({ ...prev, dropoffPoint: partner }));
  }, []);

  const setPickupPoint = React.useCallback((partner: Partner | null) => {
    setState(prev => ({ ...prev, pickupPoint: partner }));
  }, []);

  const setPaymentMethod = React.useCallback((method: PaymentMethod | null) => {
    setState(prev => ({ ...prev, paymentMethod: method }));
  }, []);

  const setTrackingCode = React.useCallback((code: string | null) => {
    setState(prev => ({ ...prev, trackingCode: code }));
  }, []);

  const reset = React.useCallback(() => {
    setState(initialState);
  }, []);

  const value = React.useMemo(
    () => ({
      state,
      setCurrentStep,
      setTermsAccepted,
      setPackageDetails,
      setRecipient,
      setDropoffPoint,
      setPickupPoint,
      setPaymentMethod,
      setTrackingCode,
      reset,
    }),
    [
      state,
      setCurrentStep,
      setTermsAccepted,
      setPackageDetails,
      setRecipient,
      setDropoffPoint,
      setPickupPoint,
      setPaymentMethod,
      setTrackingCode,
      reset,
    ]
  );

  return (
    <DeliveryCreationContext.Provider value={value}>
      {children}
    </DeliveryCreationContext.Provider>
  );
}

export function useDeliveryCreation() {
  const context = React.useContext(DeliveryCreationContext);
  if (!context) {
    throw new Error('useDeliveryCreation must be used within a DeliveryCreationProvider');
  }
  return context;
} 