export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in paise
  image: string;
  category: string;
  isVeg: boolean;
  rating: number;
  tags: string[];
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  cuisines: string[];
  sections: MenuSection[];
  reviews: Review[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface RootState {
  cart: {
    items: { [key: string]: CartItem };
    totalAmount: number;
    totalItems: number;
  };
  restaurant: {
    data: Restaurant | null;
    loading: boolean;
    error: string | null;
  };
}
