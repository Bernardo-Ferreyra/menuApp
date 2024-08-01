import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button } from 'react-bootstrap';
import ProductCard from './ProductCard';
import OrderSummary from './OrderSummary';
import TicketModal from './TicketModal';
import EditMenu from './EditMenu';
import Swal from 'sweetalert2';

const OrderForm = () => {
    const [menu, setMenu] = useState([]); // Estado para almacenar el menú
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [comments, setComments] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState([]);
    const [items, setItems] = useState([]); // Estado para almacenar los ítems del pedido
    const [totalPrice, setTotalPrice] = useState(0); // Precio total del pedido
    const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
    const [isEditingMenu, setIsEditingMenu] = useState(false); // Estado para controlar la edición del menú
    const [discount, setDiscount] = useState(0); // Estado para el descuento aplicado

    // Obtiene el menú al cargar el componente
    useEffect(() => {
        axios.get('http://localhost:5000/menu')
            .then(response => setMenu(response.data))
            .catch(error => console.error('Error fetching menu:', error));
    }, []);

    // Añade un ítem al pedido
    const addItem = (newItem) => {
        setItems((prevItems) => {
            
            // Verificar si ya existe un ítem idéntico
            const existingItemIndex = prevItems.findIndex(item =>
                item.product === newItem.product &&
                item.selectedOption === newItem.selectedOption &&
                JSON.stringify(item.extras) === JSON.stringify(newItem.extras) &&
                item.comments === newItem.comments
            );
    
            if (existingItemIndex > -1) {
                // Si el ítem ya existe, actualizar la cantidad y el precio total
                const updatedItems = [...prevItems];
                const existingItem = updatedItems[existingItemIndex];
                existingItem.quantity += 1;
                existingItem.finalPrice += newItem.finalPrice;
                setTotalPrice(prevTotal => prevTotal + newItem.finalPrice);
                return updatedItems;
            } else {
                // Si es un ítem nuevo, agregarlo a la lista
                newItem.quantity = 1;
                setTotalPrice(prevTotal => prevTotal + newItem.finalPrice);
                return [...prevItems, newItem];
            }
            
        });
        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Agregado al pedido',
            position: 'bottom-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
    };
    

    // Elimina un ítem del pedido
    const removeItem = (index) => {
        const newItems = [...items];
        const removedItem = newItems.splice(index, 1)[0];
        setItems(newItems);
        setTotalPrice(prevTotal => prevTotal - removedItem.finalPrice);
        Swal.fire({
            toast: true,
            icon: 'error',
            title: 'Eliminado del pedido',
            position: 'bottom-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
    };

    // Cierra el modal y restablece los estados
    const handleCloseModal = () => {
        setShowModal(false);
        setCustomerName('');
        setAddress('');
        setComments('');
        setPhone('');
        setPaymentMethod([]);
        setItems([]);
        setTotalPrice(0);
        setDiscount(0);
    };

    // Calcula el precio total aplicando el descuento
    const calculateTotalPriceWithDiscount = () => {
        const discountAmount = totalPrice * (discount / 100);
        return totalPrice - discountAmount;
    };

    return (
        <Container fluid>
            {isEditingMenu ? (
                <EditMenu setIsEditingMenu={setIsEditingMenu} setMenu={setMenu} />
            ) : (
                <div>
                    <Button variant="secondary" className="my-3" onClick={() => setIsEditingMenu(true)}>
                        Editar Menú
                    </Button>
                    <Row>
                        <Col md={8}>
                            <h2 className="text-primary text-center fs-1 fw-bold">MENU</h2>
                            {['COMBOS', 'CLASICAS', 'ESPECIALES', 'FRITAS', 'BEBIDAS', 'POSTRES'].map(group => (
                                <Row key={group} className="g-4">
                                    <div className="p-3 mb-2 bg-primary text-white fs-3 fw-bold">{group}</div>
                                    {menu.filter(product => product.group === group)
                                        .map((product, index) => (
                                            <Col md={4} key={index} className="d-flex">
                                                <ProductCard product={product} addItem={addItem} />
                                            </Col>
                                        ))}
                                </Row>
                            ))}
                        </Col>
                        <Col md={4}>
                            <OrderSummary
                                customerName={customerName}
                                setCustomerName={setCustomerName}
                                address={address}
                                setAddress={setAddress}
                                comments={comments}
                                setComments={setComments}
                                phone={phone}
                                setPhone={setPhone}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                items={items}
                                setItems={setItems}
                                removeItem={removeItem}
                                totalPrice={totalPrice}
                                setTotalPrice={setTotalPrice}
                                setShowModal={setShowModal}
                                discount={discount}
                                setDiscount={setDiscount}
                                calculateTotalPriceWithDiscount={calculateTotalPriceWithDiscount}
                            />
                        </Col>
                    </Row>
                    <TicketModal
                        show={showModal}
                        handleClose={handleCloseModal}
                        orderDetails={{
                            name: customerName,
                            address: address,
                            phone: phone,
                            paymentMethod: paymentMethod,
                            items: items,
                            notes: comments,
                            discount: discount,
                            totalPrice: calculateTotalPriceWithDiscount()
                        }}
                    />
                </div>
            )}
        </Container>
    );
};

export default OrderForm;
