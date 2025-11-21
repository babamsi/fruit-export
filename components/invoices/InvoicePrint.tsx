'use client';

import { useState, useEffect } from 'react';
import { useInvoiceStore } from '@/lib/stores/invoiceStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface InvoicePrintProps {
  invoiceId: string;
}

interface TransactionDetail {
  date: string;
  fruitType: string;
  originalAmount: number;
  amountCleared: number;
  remainingBalance: number;
}

export function InvoicePrint({ invoiceId }: InvoicePrintProps) {
  const [isMounted, setIsMounted] = useState(false);
  const allInvoices = useInvoiceStore((state) => state.invoices);
  const allTransactions = useTransactionStore((state) => state.transactions);
  
  const invoice = isMounted ? allInvoices.find((i) => i.id === invoiceId) : undefined;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="p-4">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-4 text-center">Invoice not found</div>;
  }

  const transactionDetails: TransactionDetail[] = invoice.transactionsCleared.map((cleared) => {
    const transaction = allTransactions.find((t) => t.id === cleared.transactionId);
    return {
      date: transaction?.date || '',
      fruitType: transaction?.fruitType || '-',
      originalAmount: transaction?.amount || 0,
      amountCleared: cleared.amountCleared,
      remainingBalance: cleared.remainingBalance,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      {/* Print Button - Hidden when printing */}
      <div className="mb-4 print:hidden flex justify-end p-4 sm:p-0">
        <Button onClick={handlePrint} size="lg">
          <Printer className="h-5 w-5 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Content - Printable */}
      <div id="invoice-print-content" className="bg-white print:bg-white w-full">
        <div className="print:p-8 p-4 sm:p-6">
          <Card className="print:border-2 print:border-gray-300 print:shadow-none">
            <CardHeader className="border-b print:border-gray-300 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold">
                    Payment Invoice
                  </CardTitle>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Invoice ID: <span className="font-mono text-xs">{invoice.id}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-muted-foreground">Invoice Date</div>
                  <div className="text-lg font-semibold">{formatDate(invoice.date)}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              {/* Supplier Information */}
              <div className="border-b pb-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">Supplier</div>
                <div className="text-xl font-bold">{invoice.supplierName}</div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Payment Amount</div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatCurrency(invoice.amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Payment Method</div>
                  <div className="text-lg font-semibold">{invoice.paymentMethod}</div>
                </div>
              </div>

              {/* Transactions Cleared */}
              {transactionDetails.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transactions Cleared</h3>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full border-collapse min-w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">
                            Date
                          </th>
                          <th className="border p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">
                            Fruit Type
                          </th>
                          <th className="border p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">
                            Original Amount
                          </th>
                          <th className="border p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">
                            Amount Cleared
                          </th>
                          <th className="border p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">
                            Remaining
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionDetails.map((detail, index) => (
                          <tr key={index} className="hover:bg-muted/50">
                            <td className="border p-2 sm:p-3 text-xs sm:text-sm">
                              {detail.date ? formatDate(detail.date) : '-'}
                            </td>
                            <td className="border p-2 sm:p-3 text-xs sm:text-sm font-medium">
                              {detail.fruitType}
                            </td>
                            <td className="border p-2 sm:p-3 text-xs sm:text-sm text-right">
                              {formatCurrency(detail.originalAmount)}
                            </td>
                            <td className="border p-2 sm:p-3 text-xs sm:text-sm text-right font-medium text-green-600">
                              {formatCurrency(detail.amountCleared)}
                            </td>
                            <td className="border p-2 sm:p-3 text-xs sm:text-sm text-right">
                              <span
                                className={
                                  detail.remainingBalance === 0
                                    ? 'text-green-600 font-medium'
                                    : 'text-yellow-600 font-medium'
                                }
                              >
                                {formatCurrency(detail.remainingBalance)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions cleared
                </div>
              )}

              {/* Total Payment */}
              <div className="border-t-2 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <div className="text-lg sm:text-xl font-bold">Total Payment</div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatCurrency(invoice.amount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          body * {
            visibility: hidden;
          }
          
          #invoice-print-content,
          #invoice-print-content * {
            visibility: visible;
          }
          
          #invoice-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-8 {
            padding: 2rem !important;
          }
          
          .print\\:border-2 {
            border-width: 2px !important;
          }
          
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}



