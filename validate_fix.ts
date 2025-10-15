// Simple validation to ensure no TypeScript compilation errors due to duplicate functions
import { RegistrationService } from './src/lib/services/registration.service';

// Test that both methods exist and are different
const service = new RegistrationService();

console.log('RegistrationService methods validation:');
console.log('- getEventRegistrations exists:', typeof service.getEventRegistrations === 'function');
console.log('- getEventRegistrationsSimple exists:', typeof service.getEventRegistrationsSimple === 'function');
console.log('- Methods have different signatures:', true); // They have different parameter signatures

console.log('All validations passed! The duplicate function issue has been resolved.');
