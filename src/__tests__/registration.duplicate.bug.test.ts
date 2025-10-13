import { describe, it, expect } from 'vitest';

// Simple test to verify no duplicate function names in registration service
describe('Registration Service Bug Fix', () => {
  it('should have distinct function names for getEventRegistrations and getEventRegistrationsSimple', () => {
    // Import the service class using dynamic import to check the structure
    const registrationServiceCode = require('fs').readFileSync(
      'C:/Users/user/Desktop/event/Indiesaas/src/lib/services/registration.service.ts',
      'utf8'
    );
    
    // Count occurrences of each function name
    const getEventRegistrationsCount = (registrationServiceCode.match(/getEventRegistrations\(/g) || []).length;
    const getEventRegistrationsSimpleCount = (registrationServiceCode.match(/getEventRegistrationsSimple\(/g) || []).length;
    
    // Verify that getEventRegistrations appears exactly once (the paginated version)
    expect(getEventRegistrationsCount).toBe(1);
    
    // Verify that getEventRegistrationsSimple appears exactly once (the renamed simple version)
    expect(getEventRegistrationsSimpleCount).toBe(1);
    
    // Total should be 2, confirming no duplicates
    expect(getEventRegistrationsCount + getEventRegistrationsSimpleCount).toBe(2);
  });
});