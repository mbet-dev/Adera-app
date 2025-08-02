import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const ADERA_RED = '#E63946';

// This is a static stepper for now.
const Stepper = () => {
  return (
    <View style={styles.stepperContainer}>
      <View style={styles.step}>
        <View style={[styles.stepCircle, styles.stepCircleActive]}>
          <Feather name="check" size={16} color="#fff" />
        </View>
        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Parameters</Text>
      </View>
      <View style={styles.stepperLine} />
      <View style={styles.step}>
        <View style={styles.stepCircle}>
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <Text style={styles.stepLabel}>To whom</Text>
      </View>
      <View style={styles.stepperLine} />
      <View style={styles.step}>
        <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
        </View>
        <Text style={styles.stepLabel}>Where</Text>
      </View>
      <View style={styles.stepperLine} />
       <View style={styles.step}>
        <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>4</Text>
        </View>
        <Text style={styles.stepLabel}>Services</Text>
      </View>
    </View>
  );
};

export default function DeliveryParametersScreen() {
  const { colors } = useTheme();
  const [deliveryMethod, setDeliveryMethod] = useState('home'); // 'point' or 'home'

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parameters</Text>
        <Text style={styles.headerPrice}>3,30 €</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stepper />

        <Text style={styles.sectionTitle}>DELIVERY METHOD</Text>

        <TouchableOpacity onPress={() => setDeliveryMethod('point')}>
            <View style={[styles.optionCard, deliveryMethod === 'point' && styles.optionCardSelected]}>
            <Text style={[styles.optionTitle, deliveryMethod === 'point' && styles.optionTitleSelected]}>Point delivery</Text>
            <Text style={[styles.optionPrice, deliveryMethod === 'point' && styles.optionPriceSelected]}>Price of service +0 €</Text>
            <View style={[styles.radioButtonOuter, deliveryMethod === 'point' && styles.radioSelected]}>
                <View style={[styles.radioButtonInner, deliveryMethod === 'point' && styles.radioButtonInnerSelected]} />
            </View>
            </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setDeliveryMethod('home')}>
            <View style={[styles.optionCard, deliveryMethod === 'home' && styles.optionCardSelected]}>
            <Text style={[styles.optionTitle, deliveryMethod === 'home' && styles.optionTitleSelected]}>Home delivery</Text>
            <Text style={[styles.optionPrice, deliveryMethod === 'home' && styles.optionPriceSelected]}>Price of service +2,50 €</Text>
            <View style={[styles.radioButtonOuter, deliveryMethod === 'home' && styles.radioSelected]}>
                <View style={[styles.radioButtonInner, deliveryMethod === 'home' && styles.radioButtonInnerSelected]} />
            </View>
            
            {deliveryMethod === 'home' && (
                <>
                <View style={styles.separator} />

                <View style={styles.addressContainer}>
                    <Text style={styles.addressLabel}>STREET AND STREET NUMBER</Text>
                    <Text style={styles.addressValue}>Str. Silfidelor, Nr.1, Ap.3</Text>

                    <Text style={styles.addressLabel}>CITY</Text>
                    <Text style={styles.addressValue}>Bucurest</Text>

                    <Text style={styles.addressLabel}>ZIP CODE</Text>
                    <Text style={styles.addressValue}>077096</Text>
                </View>
                </>
            )}
            </View>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton}>
          <Feather name="arrow-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ADERA_RED,
  },
  scrollContent: {
    padding: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#eee',
  },
  stepCircleActive: {
    backgroundColor: ADERA_RED,
    borderColor: ADERA_RED,
  },
  stepNumber: {
      color: '#aaa',
      fontWeight: 'bold'
  },
  stepLabel: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center'
  },
  stepLabelActive: {
    color: ADERA_RED,
  },
  stepperLine: {
    height: 2,
    backgroundColor: '#eee',
    flex: 1,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#aaa',
    marginBottom: 10,
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: ADERA_RED,
    borderWidth: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionTitleSelected: {
    color: ADERA_RED,
  },
  optionPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  optionPriceSelected: {
    color: ADERA_RED,
  },
  radioButtonOuter: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: ADERA_RED,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioButtonInnerSelected: {
    backgroundColor: ADERA_RED,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  addressContainer: {
    // styles for address block
  },
  addressLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  addressValue: {
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ADERA_RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 