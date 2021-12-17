import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const newCart = [...cart]; 
     
      // Verifica se o produto (id) já existe no carrinho (cart), se sim o retorna
      const productFound = newCart.find(product => product.id === productId);

      // Retorna os dados produto que está no estoque (stock)
      const { data: stock } = await api.get(`/stock/${productId}`);

      // Retorna a quantidade (amount) do produto que já está no carrinho, ou inicia do 0 para um produto novo
      const currentAmount = productFound ? productFound.amount : 0;
      const amount = currentAmount + 1;

      // Se a quantidade do produto atual for maior que a do estoque, exibe alerta de erro
      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      // Atualiza quantidade do produto atual, caso ja exista no carrinho
      if (productFound) {
        productFound.amount = amount;
      } else {
        // Adiciona um produto novo no carrinhoß
        const product = await api.get(`/products/${productId}`);
        const newProduct = {
          ...product.data,
          amount: 1
        };

        newCart.push(newProduct);
      }

      // Atualiza state e localStorage (cart)
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // Retonra uma nova lista (cart) sem o produto com o id passado no parâmetro
      const newCart = cart.filter(product => product.id !== productId);

      // Atualiza state e localStorage (cart)
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));      
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
