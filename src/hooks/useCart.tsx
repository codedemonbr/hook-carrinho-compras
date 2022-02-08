import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

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
    /** it's a interesting way of store values and recovering it
     * we are using localstorage. Getting using getItem function
     * if storagedCart is null just return a void array
     */
    const [cart, setCart] = useState<Product[]>(() => {
        const storagedCart = localStorage.getItem("@RocketShoes:cart");

        if (storagedCart) {
            return JSON.parse(storagedCart);
        }

        return [];
    });

    /** creating a context */
    const prevCartRef = useRef<Product[]>();

    /**every rendering the prevCartRef will be assined */
    useEffect(() => {
        prevCartRef.current = cart;
    });

    /** the first execution prevCartRef will be undefined. ?? is used to solve this problem*/
    const cartPreviousValue = prevCartRef.current ?? cart;

    /** For every changing we save in the localStorage */
    useEffect(() => {
        if (cartPreviousValue !== cart) {
            localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
        }
    }, [cart, cartPreviousValue]);

    const addProduct = async (productId: number) => {
        try {
            /** we are using a copy to mantain the concept of unmutability*/
            const updatedCart = [...cart];
            /** if product exists it will be assined */
            const productExists = updatedCart.find(
                (product) => product.id === productId
            );

            /** consulting the stock by product existance */
            const stock = await api.get<Stock>(`/stock/${productId}`);

            /** separating stock amount */
            const stockAmount = stock.data.amount;
            /** current amount of a product */
            const currentAmount = productExists ? productExists.amount : 0;

            /** incrementing current amount to apply the rule */
            const amount = currentAmount + 1;

            /** it prevents to add a product without stock */
            if (amount > stockAmount) {
                toast.error("Quantidade solicitada fora de estoque");
                return;
            }

            /** updating product amount if exists */
            if (productExists) {
                productExists.amount = amount;
            } else {
                /** you are adding at the first time */
                const product = await api.get(`/products/${productId}`);

                const newProduct = { ...product.data, amount: 1 };
                updatedCart.push(newProduct);
            }

            /** updatating cart */
            setCart(updatedCart);
        } catch {
            /** exception if we have trouble with adding product to the cart */
            toast.error("Erro na adição do produto");
        }
    };

    const removeProduct = (productId: number) => {
        try {
            /** unmutability copy */
            const updatedCart = [...cart];
            /** we need index to remove using splice */
            const productIndex = updatedCart.findIndex(
                (product) => product.id === productId
            );

            /** removing using splice function */
            if (productIndex >= 0) {
                updatedCart.splice(productIndex, 1);
                setCart(updatedCart);
            } else {
                throw new Error();
            }
        } catch {
            toast.error("Erro na remoção do produto");
        }
    };

    const updateProductAmount = async ({
        productId,
        amount,
    }: UpdateProductAmount) => {
        try {
            /**  you cann't remove a product without amount valid */
            if (amount <= 0) {
                return;
            }

            /** getting product in stock*/
            const stock = await api.get(`/stock/${productId}`);

            /** separating stock amount */
            const stockAmount = stock.data.amount;

            /** you cannot add amount if you don't have product in stock'*/
            if (amount > stockAmount) {
                toast.error("Quantidade solicitada fora de estoque");
                return;
            }

            /** copy to use unmutability concepts */
            const updatedCart = [...cart];

            /** searching product by id */
            const productExists = updatedCart.find(
                (product) => product.id === productId
            );

            /** finally updating cart */
            if (productExists) {
                productExists.amount = amount;
                setCart(updatedCart);
            } else {
                throw new Error();
            }
        } catch {
            toast.error("Erro na alteração de quantidade do produto");
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
