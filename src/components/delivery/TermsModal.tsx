import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View, Platform, Linking } from 'react-native';
import { Button } from '../Button';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsModal({ visible, onAccept, onDecline }: TermsModalProps) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [terms, setTerms] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTerms() {
      try {
        const { data, error: termsError } = await supabase
          .from('app_content')
          .select('content')
          .eq('type', 'delivery_terms')
          .single();

        if (termsError) throw termsError;
        setTerms(data?.content || 'Terms and conditions content not available.');
      } catch (err) {
        console.error('[TermsModal] Failed to fetch terms:', err);
        setError('Failed to load terms and conditions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (visible) {
      fetchTerms();
    }
  }, [visible]);

  const handleEligibleItemsPress = React.useCallback(() => {
    Linking.openURL('https://drive.google.com/file/d/1-GnUsKkGo-Rs343UxrmNgBpnA4hRwtZc/view?usp=drive_link');
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDecline}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.modalBackground }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Terms & Conditions
          </Text>

          {loading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading terms and conditions...
            </Text>
          ) : error ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : (
            <ScrollView style={styles.scrollView}>
              <Text style={[styles.termsText, { color: theme.colors.text }]}>
                {terms}
              </Text>
              
              <Text
                style={[styles.link, { color: theme.colors.primary }]}
                onPress={handleEligibleItemsPress}
              >
                View Eligible Items List
              </Text>
            </ScrollView>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Decline"
              onPress={onDecline}
              variant="secondary"
              style={styles.button}
            />
            <Button
              title="Accept"
              onPress={onAccept}
              variant="primary"
              style={styles.button}
              disabled={loading || !!error}
            />
          </View>
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
    ...Platform.select({
      web: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      default: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  content: {
    width: Platform.select({
      web: '80%',
      default: '90%',
    }),
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 20,
  },
}); 