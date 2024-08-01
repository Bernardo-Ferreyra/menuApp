import React from 'react';
import OrderForm from './components/OrderForm';
import { Container } from 'react-bootstrap';
import './App.css';

function App() {
    return (
        <Container fluid>
            <header className="App-header">
                <h1>La casita Azul</h1>
            </header>
            <OrderForm />
        </Container>
    );
}

export default App;