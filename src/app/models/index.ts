export type Category = 'alimentacao' | 'transporte' | 'lazer' | 'saude' | 'outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: Date;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  deadline: Date;
  color: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'success' | 'info';
  icon: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saúde',
  outros: 'Outros',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  alimentacao: 'restaurant',
  transporte: 'directions_car',
  lazer: 'sports_esports',
  saude: 'local_hospital',
  outros: 'category',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  alimentacao: '#42A5F5',
  transporte: '#26C6DA',
  lazer: '#AB47BC',
  saude: '#66BB6A',
  outros: '#FFA726',
};
