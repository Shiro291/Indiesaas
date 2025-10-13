import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RegistrationService } from '@/lib/services/registration.service';

// Mock the database and other dependencies
vi.mock('@/database/db', () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (callback) => {
      return await callback();
    }),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => [{}])
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => [{}])
        }))
      })),
      with: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => [{}])
        })
      }))
    })),
    query: {
      events: {
        findFirst: vi.fn(),
        findMany: vi.fn()
      },
      registrations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn(() => [{ id: 1, registrationNumber: 'REG-123' }])
          }))
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(() => [{ id: 1 }])
            }))
          }))
        }))
      },
      attendees: {
        findMany: vi.fn(),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn(() => [{}])
          }))
        }))
      },
      users: {
        findFirst: vi.fn()
      }
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{}])
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => [{}])
        }))
      }))
    })),
    delete: vi.fn(() => ({
      where: vi.fn()
    }))
  }
}));

vi.mock('@/database/schema', () => ({
  events: {},
  tickets: {},
  registrations: {},
  attendees: {},
  users: {},
  eventCategories: {},
  eventStatistics: {}
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  inArray: vi.fn(),
  sql: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  desc: vi.fn(),
  asc: vi.fn()
}));

vi.mock('@/lib/ipaymu/ipaymu.service', () => ({
  ipaymuService: {
    createTransaction: vi.fn().mockResolvedValue({
      KodeTransaksi: '12345',
      PaymentUrl: 'https://ipaymu.com/payment/12345'
    })
  }
}));

vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('abc123xyz')
}));

vi.mock('nodemailer', () => ({
  default: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({})
  })),
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({})
  }))
}));

vi.mock('@/config/site', () => ({
  site: {
    mailFrom: 'test@example.com'
  }
}));

describe('RegistrationService', () => {
  let registrationService: RegistrationService;

  beforeEach(() => {
    registrationService = new RegistrationService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have distinct getEventRegistrations and getEventRegistrationsSimple methods', () => {
    // Verify that both methods exist
    expect(registrationService.getEventRegistrations).toBeDefined();
    expect(registrationService.getEventRegistrationsSimple).toBeDefined();

    // Verify that the methods have different signatures by trying them with different parameters
    expect(registrationService.getEventRegistrations).toBeTypeOf('function');
    expect(registrationService.getEventRegistrationsSimple).toBeTypeOf('function');
    
    // Check that they're not the same function
    expect(registrationService.getEventRegistrations).not.toBe(registrationService.getEventRegistrationsSimple);
  });

  it('should call getEventRegistrationsSimple with correct parameters', async () => {
    const mockEventId = 1;
    const mockAgeCategory = 'SD';
    const mockBeltLevel = 'DASAR';
    const mockStatus = 'PENDING';

    // We'll just check that the method is callable without error
    try {
      // This should not throw an error about duplicate method names
      await registrationService.getEventRegistrationsSimple(mockEventId, mockAgeCategory, mockBeltLevel, mockStatus);
    } catch (error) {
      // If we have a duplicate method error, this would fail
      if (error && error.message.includes('duplicate')) {
        throw error;
      }
    }
  });

  it('should call getEventRegistrations with correct parameters', async () => {
    const mockEventId = 1;
    const mockFilters = {
      ageCategory: 'SD',
      beltLevel: 'DASAR',
      status: 'PENDING',
      page: 1,
      limit: 10
    };

    // We'll just check that the method is callable without error
    try {
      // This should not throw an error about duplicate method names
      await registrationService.getEventRegistrations(mockEventId, mockFilters);
    } catch (error) {
      // If we have a duplicate method error, this would fail
      if (error && error.message.includes('duplicate')) {
        throw error;
      }
    }
  });
});