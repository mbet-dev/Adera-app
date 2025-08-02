// =====================================================
// ADERA SERVICES - MAIN EXPORT FILE
// =====================================================

// Legacy API Service (for backward compatibility)
export { ApiService } from './api';

// New Core Services
export * from './core';

// =====================================================
// SERVICE INITIALIZATION
// =====================================================

import { initializeCoreServices, cleanupCoreServices, getServiceStatus, performHealthCheck } from './core';

// Re-export initialization functions for easy access
export {
  initializeCoreServices,
  cleanupCoreServices,
  getServiceStatus,
  performHealthCheck
};

// =====================================================
// DEPRECATION WARNINGS
// =====================================================

// Show deprecation warning for old API service
console.warn(
  'DEPRECATION WARNING: The old ApiService from "./api" is deprecated. ' +
  'Please use the new ApiService from "./core" instead. ' +
  'This will be removed in the next major version.'
); 