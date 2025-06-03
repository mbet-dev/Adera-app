import { execSync } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';

function runCommand(command: string) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Start Metro bundler
console.log('Starting Metro bundler...');
runCommand('npx expo start');

// Open in web browser
console.log('Opening in web browser...');
runCommand('npx expo start --web');

// Open in Android emulator
console.log('Opening in Android emulator...');
runCommand('npx expo start --android');

// Open in iOS simulator (macOS only)
if (!isWindows) {
  console.log('Opening in iOS simulator...');
  runCommand('npx expo start --ios');
} 