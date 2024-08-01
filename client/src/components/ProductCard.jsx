import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Form, Dropdown, DropdownButton } from 'react-bootstrap';
import axios from 'axios';

const ProductCard = ({ product, addItem }) => {
    const [selectedOption, setSelectedOption] = useState(product.options[0]?.type || '');
    const [comments, setComments] = useState('');
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [extraOptions, setExtraOptions] = useState([]);

    useEffect(() => {
        // Obtener todas las opciones del grupo EXTRAS
        axios.get('http://localhost:5000/menu')
            .then(response => {
                const extras = response.data.filter(item => item.group === 'EXTRAS');
                setExtraOptions(extras);
            })
            .catch(error => console.error('Error al obtener extras:', error));
    }, []);

    // Filtra y calcula el precio total de los extras seleccionados
    const selectedExtrasDetails = useMemo(() => {
        return extraOptions
            .filter(extra => selectedExtras.includes(extra.product))
            .flatMap(extra => extra.options.map(option => ({
                product: extra.product,
                price: option.price || 0
            })));
    }, [extraOptions, selectedExtras]);

    const handleOptionChange = (option) => {
        setSelectedOption(option.type);
    };

    const handleAddItem = () => {
        const selectedPrice = product.options.find(option => option.type === selectedOption)?.price || 0;
        const totalExtraPrice = selectedExtrasDetails.reduce((acc, extra) => acc + extra.price, 0);
        const finalPrice = selectedPrice + totalExtraPrice;

        const newItem = {
            product: product.product,
            description: product.description,
            selectedOption,
            selectedPrice,
            finalPrice,
            comments,
            extras: selectedExtrasDetails,
            quantity: 1  // SE INICIA EN 1
        };

        addItem(newItem);
        setComments('');
        setSelectedExtras([]);
    };

    return (
        <Card className="product-card">
            <Card.Body className="d-flex flex-column">
                <Card.Title className='cardtittle'>{product.product}</Card.Title>
                <Card.Text className='description'>
                    Descripción: {product.description}
                </Card.Text>
                <div>
                    Opciones:
                    {product.options.map((option, index) => (
                        <Form.Check
                            key={index}
                            type="radio"
                            id={`option-${index}`}
                            name={`options-${product.product}`}
                            label={option.type}
                            checked={selectedOption === option.type}
                            onChange={() => handleOptionChange(option)}
                        />
                    ))}
                </div>
                <Form.Group>
                    <Form.Label>Extras</Form.Label>
                    <Dropdown>
                        <DropdownButton
                            id="dropdown-extras"
                            title="Seleccionar Extras"
                            className="extra-dropdown"
                        >
                            {extraOptions.map((extra, index) => (
                                <React.Fragment key={index}>
                                    {extra.options.map((option, optIndex) => (
                                        <Dropdown.Item
                                            key={optIndex}
                                            as="button"
                                            active={selectedExtras.includes(extra.product)}
                                            onClick={() => {
                                                setSelectedExtras(prevState =>
                                                    prevState.includes(extra.product)
                                                        ? prevState.filter(e => e !== extra.product)
                                                        : [...prevState, extra.product]
                                                );
                                            }}
                                        >
                                            {extra.product} - ${option.price?.toFixed(2) || '0.00'}
                                        </Dropdown.Item>
                                    ))}
                                </React.Fragment>
                            ))}
                        </DropdownButton>
                    </Dropdown>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Comentarios</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        style={{ resize: 'none' }}
                    />
                </Form.Group>
                <Card.Text className="mt-auto">
                    Precio: ${(
                        (product.options.find(option => option.type === selectedOption)?.price || 0) +
                        selectedExtrasDetails.reduce((acc, extra) => acc + extra.price, 0)
                    ).toFixed(2)}
                </Card.Text>
                <Button variant="primary" onClick={handleAddItem}>Agregar a la orden</Button>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;

