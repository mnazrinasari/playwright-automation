import { CartItem } from '../../types/ui/CartItem';

export const parsePrice = (text: string): number =>
  parseFloat(parseFloat(text.replace(/[^0-9.]/g, '')).toFixed(2));

export const computeExpectedItemTotal = (items: Record<string, CartItem>): number =>
  parsePrice(Object.values(items).reduce((sum, item) => sum + parsePrice(item.price), 0).toString());
