export interface InvoiceRecord {
  id: string;
  enrollmentId?: string;
  studentName?: string;
  className?: string;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  paidAmount?: number;
  outstandingAmount?: number;
  dueDate?: string;
  status?: string;
  createdAt?: string;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  expenseDate?: string;
  vendor?: string;
  receiptUrl?: string;
  approvedByName?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export const manualPaymentMethods = [
  { value: 'CASH', label: 'Tien mat' },
  { value: 'BANK_TRANSFER', label: 'Chuyen khoan' },
] as const;

export const operatingCategories = [
  'Luong giao vien',
  'Mat bang',
  'Dien nuoc',
  'Van phong pham',
  'Marketing',
  'Bao tri co so',
  'Hoan phi',
  'Khac',
];

export const debtStatuses = new Set(['UNPAID', 'PARTIAL', 'PENDING']);

export const formatCurrency = (value: number | string | undefined | null) =>
  `${Number(value || 0).toLocaleString('vi-VN')}d`;

export const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString('vi-VN');
};

export const getInvoiceAmount = (invoice: InvoiceRecord) =>
  Number(invoice.finalAmount ?? invoice.totalAmount ?? 0);

export const getOutstandingAmount = (invoice: InvoiceRecord) =>
  Number(invoice.outstandingAmount ?? getInvoiceAmount(invoice) - Number(invoice.paidAmount ?? 0));

export const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'PAID':
      return 'Da thanh toan';
    case 'PARTIAL':
      return 'Thanh toan mot phan';
    case 'PENDING':
      return 'Cho thanh toan';
    case 'REFUNDED':
      return 'Da hoan phi';
    case 'CANCELLED':
      return 'Da huy';
    default:
      return 'Chua thanh toan';
  }
};

export const getPaymentMethodLabel = (method?: string) => {
  switch (method) {
    case 'CASH':
      return 'Tien mat';
    case 'BANK_TRANSFER':
      return 'Chuyen khoan';
    case 'CREDIT_CARD':
      return 'The';
    case 'MOMO':
      return 'Momo';
    case 'VN_PAY':
      return 'VNPay';
    default:
      return method || '-';
  }
};

export const getMonthKey = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return 'Khac';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const isCurrentMonth = (value?: string) => {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};
