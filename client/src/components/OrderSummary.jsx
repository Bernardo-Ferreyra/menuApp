import React from 'react';
import { ListGroup, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const OrderSummary = ({
    customerName, setCustomerName,
    address, setAddress,
    comments, setComments,
    phone, setPhone,
    paymentMethod, setPaymentMethod,
    items, setItems,
    setTotalPrice,
    setShowModal,
    discount, setDiscount,
    calculateTotalPriceWithDiscount,
    removeItem,
}) => {

    // Función para manejar la generación del ticket
    const handleGenerateTicketClick = () => {
        // Validar campos obligatorios
        if (!customerName || !address || paymentMethod.length === 0) {
            Swal.fire({
                toast: true,
                icon: 'warning',
                title: 'Por favor, complete todos los campos obligatorios.',
                position: 'center',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }
        // Validar que al menos un ítem esté seleccionado
        if (items.length === 0) {
            Swal.fire({
                toast: true,
                icon: 'warning',
                title: 'Por favor, seleccione al menos un producto.',
                position: 'center',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }
        // Mostrar el modal
        setShowModal(true);
    };

    // Función para manejar el cambio en el método de pago
    const handlePaymentMethodChange = (event) => {
        const { value, checked } = event.target;
        setPaymentMethod((prevMethods) => 
            checked ? [...prevMethods, value] : prevMethods.filter((method) => method !== value)
        );
    };

    // Función para manejar el cambio de cantidad
    const handleQuantityChange = (index, newQuantity) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            const item = updatedItems[index];
            const difference = newQuantity - item.quantity;
            item.quantity = newQuantity;
            item.finalPrice = item.selectedPrice * newQuantity + item.extras.reduce((acc, extra) => acc + extra.price, 0) * newQuantity;

            // Actualizar el precio total
            setTotalPrice((prevTotal) => prevTotal + (item.selectedPrice + item.extras.reduce((acc, extra) => acc + extra.price, 0)) * difference);

            return updatedItems;
        });
    };

    return (
        <div className='bg-light p-4'>
            <h2 className='text-center'>Orden comanda</h2>
            
            {/* Campos del formulario para la información del cliente */}
            <Form.Group>
                <Form.Label>Nombre cliente</Form.Label>
                <Form.Control
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </Form.Group>
            
            {/* Opciones de método de pago */}
            <Form.Group>
                <Form.Label>Método de Pago</Form.Label>
                <div>
                    <Form.Check
                        type="checkbox"
                        label="Efectivo"
                        value="Efectivo"
                        checked={paymentMethod.includes('Efectivo')}
                        onChange={handlePaymentMethodChange}
                    />
                    <Form.Check
                        type="checkbox"
                        label="QR"
                        value="QR"
                        checked={paymentMethod.includes('QR')}
                        onChange={handlePaymentMethodChange}
                    />
                </div>
            </Form.Group>
            
            {/* Comentarios adicionales */}
            <Form.Group>
                <Form.Label>Comentarios</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    style={{ resize: 'none' }}
                />
            </Form.Group>

            {/* Resumen de pedido */}
            <h3>Pedido</h3>
            <ListGroup>
                {items.map((item, index) => (
                    <ListGroup.Item key={index}>
                        {item.product} -{item.selectedOption} ${item.selectedPrice.toFixed(2)}
                        <p>
                            x <Form.Control
                                type="number"
                                value={item.quantity}
                                min={1}
                                onChange={(e) => handleQuantityChange(index, Math.max(1, parseInt(e.target.value)))}
                                style={{ width: '60px', display: 'inline-block', marginLeft: '10px' }}
                            /> unidades
                        </p>     
                        <p className='py-0 m-0'>{item.comments}</p>
                        {item.extras && item.extras.map((extra, i) => (
                            <p className='py-0 m-0' key={i}> EXTRA: {extra.product} - ${extra.price.toFixed(2)}</p>
                        ))}
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeItem(index)}
                            style={{ float: 'right' }}
                        >
                            Eliminar
                        </Button>
                        <br />
                        <p className='p-0 m-0 mt-2' style={{ textAlign: 'right' }}><strong>${item.finalPrice.toFixed(2)}</strong></p>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {/* Selección de descuento */}
            <Form.Group>
                <Form.Label>Descuento</Form.Label>
                <Form.Control
                    as="select"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                >
                    {[0, 5, 10, 15, 20, 25].map((value) => (
                        <option key={value} value={value}>{value}%</option>
                    ))}
                </Form.Control>
            </Form.Group>

            {/* Precio total con descuento aplicado */}
            <h3>Precio total: ${calculateTotalPriceWithDiscount().toFixed(2)}</h3>
            <Button variant="success" className='w-100' size="lg" onClick={handleGenerateTicketClick}>
                Generar Ticket
            </Button>
        </div>
    );
};

export default OrderSummary;

