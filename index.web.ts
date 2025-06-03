import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Register the app
registerRootComponent(App);

// Add web-specific setup
if (Platform.OS === 'web') {
  // Add any web-specific initialization here
  const rootTag = document.getElementById('root');
  if (rootTag) {
    rootTag.style.height = '100%';
  }
} 