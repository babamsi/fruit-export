// Type definitions for Fruit Export Management System

export type TransactionStatus = 'Pending' | 'Partially Paid' | 'Fully Paid';
export type ContainerStatus = 'Preparing' | 'In Transit' | 'Delivered';
export type ExpenseCategory = 
  | 'Supplier Payment'
  | 'Packaging Materials'
  | 'Shipping'
  | 'Labor'
  | 'Other';

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  fruitSpecialties: string[];
  totalOwed: number;
  totalPaid: number;
  balance: number;
}

export interface Transaction {
  id: string;
  supplierId: string;
  supplierName: string;
  fruitType: string;
  quantity: number;
  amount: number;
  date: string; // ISO date string
  containerId?: string;
  status: TransactionStatus;
  remainingBalance: number;
}

export interface TransactionCleared {
  transactionId: string;
  amountCleared: number;
  remainingBalance: number;
}

export interface Invoice {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  date: string; // ISO date string
  transactionsCleared: TransactionCleared[];
  paymentMethod: string;
}

export interface ContainerSupplier {
  supplierId: string;
  supplierName: string;
  fruitType: string;
  quantity: number;
  transactionId: string;
  amount: number;
}

export interface Consignee {
  name: string; // Person/contact name
  company: string; // Company name
  location: string; // Address/location
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  additionalInfo?: string; // Any additional information
}

export interface Container {
  id: string;
  containerNumber: string;
  status: ContainerStatus;
  suppliers: ContainerSupplier[];
  consignee?: Consignee;
  shipDate?: string; // ISO date string
  deliveryDate?: string; // ISO date string
  totalValue: number;
}

export interface PackagingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestocked?: string; // ISO date string
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string; // ISO date string
  supplierId?: string;
  invoiceId?: string;
}

export interface Supply {
  id: string;
  date: string; // ISO date string - date of supply
  containerId: string; // Container ID
  containerNumber: string; // Container number for display
  supplierId: string; // Supplier ID
  supplierName: string; // Supplier name for display
  details: string; // Notes/details
  fruitType: string;
  quantity: number;
  price: number; // Price per unit
  totalAmount: number; // Auto-calculated: quantity * price
  transactionId?: string; // Linked transaction ID (if created from supply)
}


