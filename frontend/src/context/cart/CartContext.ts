import { createContext } from 'react';
import { CartContextType } from './CartContext.types';


export const CartContext = createContext<CartContextType | undefined>(undefined);