import React from 'react';
import { Modal, StyleSheet, View, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { TermsModal } from '../TermsModal';
import { PackageDetailsForm } from './PackageDetailsForm';

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

  // Reset state when modal is closed
  React.useEffect(() => {
    if (!visible) {
      reset();
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.modalBackground }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {currentStep === 1 && (
            <PackageDetailsForm onNext={handleNextStep} />
          )}
          {/* Add more steps here */}
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