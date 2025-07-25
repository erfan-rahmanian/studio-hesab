export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO string format
  category: string; // Added for transaction categorization
  type: 'income' | 'expense'; // 'income' for بستانکار (credit), 'expense' for طلبکار (debit)
}
