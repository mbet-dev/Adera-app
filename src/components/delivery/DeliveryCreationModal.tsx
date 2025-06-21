import React from 'react';
import { Modal, StyleSheet, View, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { TermsModal } from '../TermsModal';
import { PackageDetailsForm } from './PackageDetailsForm';
import { RecipientForm } from './RecipientForm';
import { LocationSelectionForm } from './LocationSelectionForm';
import { PaymentMethodForm } from './PaymentMethodForm';
import { ConfirmationForm } from './ConfirmationForm';

interface DeliveryCreationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DeliveryCreationModal({
  visible,
  onClose,
}: DeliveryCreationModalProps) {
  const theme = useTheme();
  const {
    state: { currentStep, termsAccepted },
    setCurrentStep,
    setTermsAccepted,
    reset,
  } = useDeliveryCreation();

  // This effect ensures that if the modal is closed unexpectedly (e.g., hardware back button), the state is cleared.
  React.useEffect(() => {
    if (!visible) {
      // A small delay ensures the UI has time to close before state is wiped
      setTimeout(() => {
        reset();
      }, 300);
    }
  }, [visible, reset]);

  const handleTermsAccept = React.useCallback(() => {
    setTermsAccepted(true);
    setCurrentStep(1);
  }, [setTermsAccepted, setCurrentStep]);

  const handleTermsDecline = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleNextStep = React.useCallback(() => {
    setCurrentStep(currentStep + 1);
  }, [currentStep, setCurrentStep]);

  const handlePrevStep = React.useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  }, [currentStep, setCurrentStep, onClose]);

  // Show terms modal first if not accepted
  if (!termsAccepted) {
    return (
      <TermsModal
        visible={visible}
        onAccept={handleTermsAccept}
        onClose={handleTermsDecline}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PackageDetailsForm onNext={handleNextStep} onBack={handlePrevStep} />;
      case 2:
        return <RecipientForm onNext={handleNextStep} onBack={handlePrevStep} />;
      case 3:
        return <LocationSelectionForm onNext={handleNextStep} onBack={handlePrevStep} />;
      case 4:
        return <PaymentMethodForm onNext={handleNextStep} onBack={handlePrevStep} />;
      case 5:
        return <ConfirmationForm onConfirm={onClose} onBack={handlePrevStep} />;
      default:
        return null;
    }
  };

  if (currentStep === 0) {
    return null; // Don't render anything if we haven't started (e.g., after terms accepted but before step 1 set)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.modalBackground }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {renderStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: Platform.select({
      web: '80%',
      default: '90%',
    }),
    flex: 1,
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
}); 