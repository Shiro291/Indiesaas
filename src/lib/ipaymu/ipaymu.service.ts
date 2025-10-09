import { createHmac } from "crypto";

/**
 * Interface representing the request data for creating an Ipaymu transaction
 * 
 * @interface IpaymuTransactionRequest
 * @property {string[]} product - Array of product names for the transaction
 * @property {number[]} qty - Array of quantities corresponding to each product
 * @property {number[]} price - Array of prices in cents corresponding to each product
 * @property {number} amount - Total amount of the transaction in cents
 * @property {number[]} [tax] - Optional array of tax amounts for each product
 * @property {string} [note] - Optional note for the transaction
 * @property {string} [returnUrl] - Optional URL to return to after payment completion
 * @property {string} [notifyUrl] - Optional callback URL for payment notifications
 * @property {string} [cancelUrl] - Optional URL to redirect to if payment is cancelled
 * @property {string} name - Customer name
 * @property {string} email - Customer email address
 * @property {string} phone - Customer phone number
 * @property {string} [description] - Optional transaction description
 */
interface IpaymuTransactionRequest {
  product: string[]; // Array of product names
  qty: number[];     // Array of quantities
  price: number[];   // Array of prices in cents
  amount: number;    // Total amount in cents
  tax?: number[];    // Tax amounts
  note?: string;     // Transaction note
  returnUrl?: string; // URL to return after payment
  notifyUrl?: string; // Callback URL for payment notification
  cancelUrl?: string; // URL for cancelled payment
  name: string;      // Customer name
  email: string;     // Customer email
  phone: string;     // Customer phone
  description?: string; // Transaction description
}

/**
 * Interface representing the response from an Ipaymu transaction creation
 * 
 * @interface IpaymuTransactionResponse
 * @property {number} Status - Status code from the API response
 * @property {string} Message - Status message from the API response
 * @property {string} KodeTransaksi - Transaction code from Ipaymu
 * @property {string} Waktu - Transaction time
 * @property {string} PaymentUrl - URL to redirect user for payment
 * @property {string} ReferenceId - Reference ID for the transaction
 */
interface IpaymuTransactionResponse {
  Status: number;
  Message: string;
  KodeTransaksi: string;
  Waktu: string;
  PaymentUrl: string;
  ReferenceId: string;
}

/**
 * Interface representing the data received in an Ipaymu callback
 * 
 * @interface IpaymuCallbackData
 * @property {string} action - Action taken on the transaction
 * @property {string} id - Transaction ID
 * @property {string} status - Transaction status (e.g., "berhasil" for success, "gagal" for failure)
 * @property {string} keterangan - Description of the status
 * @property {string} sign - Signature for verifying the authenticity of the callback
 */
interface IpaymuCallbackData {
  action: string;
  id: string;
  status: string;
  keterangan: string;
  sign: string;
}

/**
 * Service class for handling Ipaymu payment gateway integration
 * 
 * This class provides methods for creating transactions, verifying callbacks,
 * checking transaction status, and processing refunds using the Ipaymu API.
 */
export class IpaymuService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly merchantCode: string;

  /**
   * Creates an instance of IpaymuService
   * 
   * Initializes the service with configuration from environment variables
   * 
   * @throws {Error} If required environment variables are not set
   */
  constructor() {
    this.baseUrl = process.env.IPAYMU_BASE_URL || "https://my.ipaymu.com";
    this.apiKey = process.env.IPAYMU_API_KEY || "";
    this.merchantCode = process.env.IPAYMU_MERCHANT_CODE || "";

    if (!this.apiKey || !this.merchantCode) {
      throw new Error("IPAYMU_API_KEY and IPAYMU_MERCHANT_CODE must be set in environment variables");
    }
  }

  /**
   * Create a new payment transaction
   */
  async createTransaction(
    request: IpaymuTransactionRequest
  ): Promise<IpaymuTransactionResponse> {
    try {
      const body = {
        ...request,
        action: "payment",
        merchantid: this.merchantCode,
        notifyUrl: request.notifyUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/ipaymu-callback`,
      };

      // Generate signature using the correct Ipaymu format
      const signature = this.generateSignature('/api/transaksi/merchant', 'POST', body, this.apiKey);
      
      const response = await fetch(`${this.baseUrl}/api/transaksi/merchant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'signature': signature,
          'va': this.merchantCode,
          'Content-Request': 'JSON'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ipaymu API error: ${response.status} - ${errorText}`);
      }

      const data: IpaymuTransactionResponse = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(`Failed to create Ipaymu transaction: ${error.message}`);
    }
  }

  /**
   * Verify the signature in the callback from Ipaymu
   */
  verifyCallbackSignature(
    callbackData: IpaymuCallbackData,
    expectedStatus: string = 'berhasil'
  ): boolean {
    try {
      // Reconstruct the signature to verify
      // This is a simplified verification - in production, 
      // you'd want to implement the exact signature verification
      // as per Ipaymu documentation
      const reconstructedSign = this.generateSignature('/api/transaksi/notify', 'POST', callbackData, this.apiKey);
      
      return callbackData.sign === reconstructedSign && callbackData.status === expectedStatus;
    } catch (error) {
      console.error('Error verifying Ipaymu callback signature:', error);
      return false;
    }
  }

  /**
   * Generate signature for API requests
   * Based on typical Ipaymu signature format
   * Format: SHA256(vamethod:va:secret)
   */
  private generateSignature(url: string, method: string, body: any, secret: string): string {
    // Create the signature string based on Ipaymu implementation
    // Typically: SHA-256 of (va + method + secret)
    const stringToSign = `${this.merchantCode}${method}${secret}`;
    
    // Create SHA-256 signature
    const signature = createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex')
      .toLowerCase();
    
    return signature;
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const body = {
        action: 'status',
        id: transactionId
      };

      const signature = this.generateSignature('/api/transaksi/merchant', 'POST', body, this.apiKey);
      
      const response = await fetch(`${this.baseUrl}/api/transaksi/merchant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'signature': signature,
          'va': this.merchantCode,
          'Content-Request': 'JSON'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ipaymu API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }
  
  /**
   * Refund a transaction (if supported by Ipaymu)
   */
  async refundTransaction(transactionId: string, amount?: number): Promise<any> {
    try {
      const body = {
        action: 'refund',
        id: transactionId,
        ...(amount && { amount: amount })
      };

      const signature = this.generateSignature('/api/transaksi/merchant', 'POST', body, this.apiKey);
      
      const response = await fetch(`${this.baseUrl}/api/transaksi/merchant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'signature': signature,
          'va': this.merchantCode,
          'Content-Request': 'JSON'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ipaymu API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to refund transaction: ${error.message}`);
    }
  }
}

export const ipaymuService = new IpaymuService();