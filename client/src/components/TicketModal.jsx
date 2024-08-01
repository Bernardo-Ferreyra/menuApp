import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const TicketModal = ({ show, handleClose, orderDetails }) => {
    // Retorna null si no hay detalles del pedido
    if (!orderDetails) return null;

    // Desestructuración de los detalles del pedido
    const { name, address, phone, paymentMethod, totalPrice, items, notes, discount } = orderDetails;

    // Función para manejar la generación de la orden
    const handleGenerateOrder = () => {
        const order = { customerName: name, address, comments: notes, phone, paymentMethod, items, totalPrice, discount };
        
        axios.post('http://localhost:5000/orders/add', order)
            .then(res => {
                console.log(res.data);
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: '¡Orden generada exitosamente!',
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                handleClose();
            })
            .catch(err => {
                console.error('Error al generar la orden:', err);
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Hubo un error al generar la orden. Por favor, inténtalo nuevamente.',
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            });
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Resumen del Pedido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="order-summary">
                    <p><strong>Nombre:</strong> {name}</p>
                    <p><strong>Dirección:</strong> {address}</p>
                    <p><strong>Teléfono:</strong> {phone}</p>
                    <p><strong>Método de Pago:</strong> {paymentMethod.join(', ')}</p>
                    <p><strong>Comentarios:</strong> {notes}</p>
                </div>
                <h5>Items:</h5>
                <ul className="order-items">
                    {items.map((item, index) => (
                        <li key={index} className="order-item">
                            <p>
                                <strong>{item.product} ({item.quantity})</strong>
                                <span style={{ float: 'right' }}>${item.selectedPrice.toFixed(2)}</span> 
                                <br /> 
                                {item.selectedOption}
                            </p>
                            {item.comments && <p>Comentarios: {item.comments}</p>}
                            {item.extras && item.extras.map((extra, i) => (
                                <p key={i}>
                                    Extra: {extra.product}
                                    <span style={{ float: 'right' }}>${extra.price.toFixed(2)}</span>
                                </p>
                            ))}
                            <p style={{ textAlign: 'right', marginTop: '10px' }}>
                                <strong>${item.finalPrice.toFixed(2)}</strong>
                            </p>
                            <hr />
                        </li>
                    ))}
                </ul>
                {discount > 0 && (
                    <div className="discount-section">
                        <p><strong>Descuento:</strong> {discount}%</p>
                    </div>
                )}
                <h4 style={{ textAlign: 'right' }}>Total: ${totalPrice.toFixed(2)}</h4>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleGenerateOrder}>
                    Generar Orden
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TicketModal;
