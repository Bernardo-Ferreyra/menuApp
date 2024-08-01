import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

const EditMenu = ({ setIsEditingMenu, setMenu }) => {
    // Estado para manejar los elementos del menú
    const [menuItems, setMenuItems] = useState([]);
    const [newProduct, setNewProduct] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newGroup, setNewGroup] = useState('');
    const [newOptions, setNewOptions] = useState([{ id: uuidv4(), type: '', price: '' }]);
    const [editedItems, setEditedItems] = useState([]);

    // Fetch de elementos del menú al montar el componente
    useEffect(() => {
        axios.get('http://localhost:5000/menu')
            .then(response => setMenuItems(response.data))
            .catch(error => console.error('Error fetching menu:', error));
    }, []);

    // Manejo de cambios en los campos de opción nueva
    const handleNewOptionChange = (id, field, value) => {
        setNewOptions(prevOptions =>
            prevOptions.map(option =>
                option.id === id ? { ...option, [field]: value } : option
            )
        );
    };

    // Añadir un nuevo campo de opción
    const addNewOptionField = () => {
        setNewOptions(prevOptions => [...prevOptions, { id: uuidv4(), type: '', price: '' }]);
    };

    // Eliminar un campo de opción
    const removeNewOptionField = (id) => {
        setNewOptions(prevOptions => prevOptions.filter(option => option.id !== id));
    };

    // Añadir un nuevo producto al menú
    const addMenuItem = () => {
        // Validación de campos requeridos
        if (!newProduct || !newDescription || !newGroup || newOptions.some(option => !option.type || !option.price)) {
            Swal.fire({
                toast: true,
                icon: 'warning',
                title: `Por favor completa todos los campos antes de agregar el producto.`,
                position: 'center',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        const newItem = {
            id: uuidv4(),
            product: newProduct,
            description: newDescription,
            group: newGroup,
            options: newOptions.map(option => ({ type: option.type, price: parseFloat(option.price) }))
        };

        axios.post('http://localhost:5000/menu/add', newItem)
            .then(response => {
                setMenuItems(prevItems => [...prevItems, response.data]);
                setMenu(prevItems => [...prevItems, response.data]);
                // Resetear campos de entrada
                setNewProduct('');
                setNewDescription('');
                setNewGroup('');
                setNewOptions([{ id: uuidv4(), type: '', price: '' }]);
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: `¡Producto agregado correctamente!`,
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            })
            .catch(error => {
                console.error('Error adding menu item:', error);
                alert('Error al agregar producto. Por favor, revisa la consola para más detalles.');
            });
    };

    // Manejo de cambios en los campos del producto
    const handleInputChange = (id, field, value) => {
        setMenuItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
        if (!editedItems.includes(id)) {
            setEditedItems(prevItems => [...prevItems, id]);
        }
    };

    // Manejo de cambios en el precio de una opción del producto
    const handleOptionPriceChange = (productId, optionType, value) => {
        setMenuItems(prevItems =>
            prevItems.map(item => {
                if (item.id === productId) {
                    const updatedOptions = item.options.map(option =>
                        option.type === optionType ? { ...option, price: parseFloat(value) } : option
                    );
                    return { ...item, options: updatedOptions };
                }
                return item;
            })
        );
        if (!editedItems.includes(productId)) {
            setEditedItems(prevItems => [...prevItems, productId]);
        }
    };

    // Guardar los cambios realizados en un producto
    const saveChanges = (id) => {
        const updatedItem = menuItems.find(item => item.id === id);
        axios.post('http://localhost:5000/menu/update', { updatedItems: [updatedItem] })
            .then(response => {
                setEditedItems(prevItems => prevItems.filter(i => i !== id));
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: `¡Cambios guardados exitosamente!`,
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            })
            .catch(error => {
                console.error('Error updating menu item:', error);
                alert('Error al guardar cambios. Por favor, revisa la consola para más detalles.');
            });
    };

    // Eliminar un producto del menú
    const removeMenuItem = (id) => {
        axios.post('http://localhost:5000/menu/remove', { id })
            .then(response => {
                setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
                setMenu(prevItems => prevItems.filter(item => item.id !== id));
                Swal.fire({
                    toast: true,
                    icon: 'info',
                    title: `¡Elemento eliminado exitosamente!`,
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            })
            .catch(error => {
                console.error('Error removing menu item:', error);
                alert('Error al eliminar. Por favor, revisa la consola para más detalles.');
            });
    };

    // Renderizar los elementos del menú por grupo
    const renderMenuItemsByGroup = (group) => (
        <>
            <div className="p-3 mb-2 bg-primary text-white fs-3 fw-bold">{group}</div>
            <Row>
                {menuItems.filter(item => item.group === group).map(item => (
                    <Col key={item.id} md={4} className="d-flex">
                        <Card className="menu-item-card mb-4 flex-grow-1">
                            <Card.Body className="d-flex flex-column">
                                <Form>
                                    <Form.Group controlId={`formProduct-${item.id}`}>
                                        <Form.Label>Producto</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={item.product}
                                            onChange={(e) => handleInputChange(item.id, 'product', e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId={`formDescription-${item.id}`}>
                                        <Form.Label>Descripción</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleInputChange(item.id, 'description', e.target.value)}
                                        />
                                    </Form.Group>
                                    {item.options.map(option => (
                                        <Form.Group key={option.type} controlId={`formOptionPrice-${item.id}-${option.type}`}>
                                            <Form.Label>{option.type} - Precio</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={option.price}
                                                onChange={(e) => handleOptionPriceChange(item.id, option.type, e.target.value)}
                                            />
                                        </Form.Group>
                                    ))}
                                    <div className="mt-auto d-flex justify-content-between">
                                        <Button variant="danger" className='mt-3' onClick={() => removeMenuItem(item.id)}>Eliminar</Button>
                                        <Button variant="primary" className='mt-3' onClick={() => saveChanges(item.id)}>Guardar Cambios</Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );

    return (
        <Container>
            <Button 
                variant="primary" 
                className="my-3" 
                onClick={() => {
                    setIsEditingMenu(false)
                    window.location.reload()
                }}
            >
            Volver al Formulario de Pedido
            </Button>

            <h2>Editar Menú</h2>

            <Form className="mb-4">
                <Form.Group controlId="formNewProduct">
                    <Form.Label>Producto</Form.Label>
                    <Form.Control type="text" value={newProduct} onChange={(e) => setNewProduct(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formNewDescription">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formNewGroup">
                    <Form.Label>Grupo</Form.Label>
                    <Form.Control as="select" value={newGroup} onChange={(e) => setNewGroup(e.target.value)}>
                        <option value="">Selecciona un grupo</option>
                        <option value="COMBOS">COMBOS</option>
                        <option value="CLASICAS">CLASICAS</option>
                        <option value="ESPECIALES">ESPECIALES</option>
                        <option value="FRITAS">FRITAS</option>
                        <option value="POSTRES">POSTRES</option>
                        <option value="EXTRAS">EXTRAS</option>
                        <option value="BEBIDAS">BEBIDAS</option>
                    </Form.Control>
                </Form.Group>
                {newOptions.map(option => (
                    <div key={option.id} className="new-option-group">
                        <Form.Group controlId={`formNewOptionType-${option.id}`}>
                            <Form.Label>Tipo de Opción</Form.Label>
                            <Form.Control
                                type="text"
                                value={option.type}
                                onChange={(e) => handleNewOptionChange(option.id, 'type', e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId={`formNewOptionPrice-${option.id}`}>
                            <Form.Label>Precio</Form.Label>
                            <Form.Control
                                type="number"
                                value={option.price}
                                onChange={(e) => handleNewOptionChange(option.id, 'price', e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="danger" className="mt-4" onClick={() => removeNewOptionField(option.id)}>Eliminar Opción</Button>
                    </div>
                ))}
                <Button variant="secondary" className="mx-2" onClick={addNewOptionField}>Añadir Otra Opción</Button>
                <Button variant="success" className="mx-2" onClick={addMenuItem}>Agregar Producto</Button>
            </Form>
            <h3 className="text-primary text-center">Listado del Menú</h3>
            {['COMBOS', 'CLASICAS', 'ESPECIALES', 'FRITAS', 'POSTRES', 'EXTRAS', 'BEBIDAS'].map(group => renderMenuItemsByGroup(group))}
        </Container>
    );
};

export default EditMenu;
