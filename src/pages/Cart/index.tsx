import React from "react";
import {
    MdDelete,
    MdAddCircleOutline,
    MdRemoveCircleOutline,
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
    id: number;
    title: string;
    price: number;
    image: string;
    amount: number;
}

const Cart = (): JSX.Element => {
    /** destructuring to use cart, update and remove */
    const { cart, removeProduct, updateProductAmount } = useCart();

    /** we are creating a copy of cart with price and subtotal */
    const cartFormatted = cart.map((product) => ({
        ...product,
        priceFormatted: formatPrice(product.price),
        subtotal: formatPrice(product.price * product.amount),
    }));

    /** total is calculated with a reduce accumulating all kind of expenses */
    const total = formatPrice(
        cart.reduce((sumTotal, product) => {
            return sumTotal + product.amount * product.price;
        }, 0)
    );

    /** Increment product is update a product and a new value of amount */
    function handleProductIncrement(product: Product) {
        updateProductAmount({
            productId: product.id,
            amount: product.amount + 1,
        });
    }

    /** Decrement is a update subtracting the amount  */
    function handleProductDecrement(product: Product) {
        updateProductAmount({
            productId: product.id,
            amount: product.amount - 1,
        });
    }

    /** to remove a product we need to send the product ID and the hook will handle it for us */
    function handleRemoveProduct(productId: number) {
        removeProduct(productId);
    }

    return (
        <Container>
            <ProductTable>
                <thead>
                    <tr>
                        <th aria-label="product image" />
                        <th>PRODUTO</th>
                        <th>QTD</th>
                        <th>SUBTOTAL</th>
                        <th aria-label="delete icon" />
                    </tr>
                </thead>
                <tbody>
                    {/* the first element rendered needs the key. Never forget it */}
                    {cartFormatted.map((product) => (
                        <tr key={product.id} data-testid="product">
                            <td>
                                <img src={product.image} alt={product.title} />
                            </td>
                            <td>
                                <strong>{product.title}</strong>
                                <span>{product.priceFormatted}</span>
                            </td>
                            <td>
                                <div>
                                    <button
                                        type="button"
                                        data-testid="decrement-product"
                                        disabled={product.amount <= 1}
                                        onClick={() =>
                                            handleProductDecrement(product)
                                        }
                                    >
                                        <MdRemoveCircleOutline size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        data-testid="product-amount"
                                        readOnly
                                        value={product.amount}
                                    />
                                    <button
                                        type="button"
                                        data-testid="increment-product"
                                        onClick={() =>
                                            handleProductIncrement(product)
                                        }
                                    >
                                        <MdAddCircleOutline size={20} />
                                    </button>
                                </div>
                            </td>
                            <td>
                                <strong>{product.subtotal}</strong>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    data-testid="remove-product"
                                    onClick={() =>
                                        handleRemoveProduct(product.id)
                                    }
                                >
                                    <MdDelete size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </ProductTable>

            <footer>
                <button type="button">Finalizar pedido</button>

                <Total>
                    <span>TOTAL</span>
                    <strong>{total}</strong>
                </Total>
            </footer>
        </Container>
    );
};

export default Cart;
