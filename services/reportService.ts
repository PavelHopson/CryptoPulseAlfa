
import { Transaction, UserProfile } from '../types';

export const downloadTransactionReport = (user: UserProfile) => {
  if (!user.transactions || user.transactions.length === 0) {
    alert("Нет транзакций для экспорта.");
    return;
  }

  // 1. Define Headers
  const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Status'];

  // 2. Format Rows
  const rows = user.transactions.map(tx => [
    tx.id,
    new Date(tx.date).toLocaleString('ru-RU'), // Localize date
    tx.type,
    tx.amount.toFixed(2),
    tx.currency,
    tx.status
  ]);

  // 3. Construct CSV Content
  // Add BOM (\uFEFF) so Excel opens UTF-8 correctly
  let csvContent = '\uFEFF' + headers.join(',') + '\n';

  rows.forEach(row => {
    const rowString = row.map(cell => `"${cell}"`).join(','); // Quote cells to handle commas in data
    csvContent += rowString + '\n';
  });

  // 4. Create Blob and Download Link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const filename = `CryptoPulse_Report_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
