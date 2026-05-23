export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'completed';

export type OrderItem = {
  name: string;
  quantity: number;
  price?: number;
};

export type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending' | 'credit';
  isSpecialCustomer: boolean;
  timestamp: string;
  stitchImage: string | null;
};
