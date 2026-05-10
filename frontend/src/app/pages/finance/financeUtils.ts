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
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
] as const;

export const operatingCategories = [
  'Lương giáo viên',
  'Mặt bằng',
  'Điện nước',
  'Văn phòng phẩm',
  'Marketing',
  'Bảo trì cơ sở',
  'Hoàn phí',
  'Khác',
];

export const debtStatuses = new Set(['UNPAID', 'PARTIAL', 'PENDING']);

export const formatCurrency = (value: number | string | undefined | null) =>
  `${Number(value || 0).toLocaleString('vi-VN')}đ`;

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
      return 'Đã thanh toán';
    case 'PARTIAL':
      return 'Thanh toán một phần';
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'REFUNDED':
      return 'Đã hoàn phí';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return 'Chưa thanh toán';
  }
};

export const getPaymentMethodLabel = (method?: string) => {
  switch (method) {
    case 'CASH':
      return 'Tiền mặt';
    case 'BANK_TRANSFER':
      return 'Chuyển khoản';
    case 'CREDIT_CARD':
      return 'Thẻ tín dụng';
    case 'MOMO':
      return 'Ví MoMo';
    case 'VN_PAY':
      return 'VNPay';
    default:
      return method || '-';
  }
};

export const getMonthKey = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return 'Khác';
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
