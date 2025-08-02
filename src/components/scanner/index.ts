import { Platform } from 'react-native';

// Import the appropriate QR scanner based on platform
let QRScanner: any;

if (Platform.OS === 'web') {
  QRScanner = require('./QRScanner.web').default;
} else {
  QRScanner = require('./QRScanner').default;
}

export default QRScanner; 