const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

//impresora usb
const escpos = require('escpos')
escpos.USB = require('escpos-usb')
const USB = escpos.USB
const device = new USB()
const printer = new escpos.Printer(device,{ encoding: 'CP850' })


const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


//listado de productos y ordenes
const MENU_FILE = 'menu.json'
const ORDERS_FILE = 'orders.json'


//funcion para leer el menu
const readMenuFromFile = () => {
    try {
        const data = fs.readFileSync(MENU_FILE, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error reading menu file:', error)
        return []
    }
};

// funcion para editar el menu
const writeMenuToFile = (menu) => {
    try {
        fs.writeFileSync(MENU_FILE, JSON.stringify(menu, null, 2), 'utf8')
    } catch (error) {
        console.error('Error writing menu file:', error)
    }
};

// Get menu items
app.get('/menu', (req, res) => {
    const menu = readMenuFromFile()
    res.json(menu)
});

// Add new menu item
app.post('/menu/add', (req, res) => {
    const newItem = req.body
    const menu = readMenuFromFile()
    menu.push(newItem)
    writeMenuToFile(menu)
    res.json(newItem)
});

// Update existing menu item
app.post('/menu/update', (req, res) => {
    const { updatedItems } = req.body

    const menu = readMenuFromFile()
    const updatedMenu = menu.map(item =>
        updatedItems.find(updatedItem => updatedItem.id === item.id) || item
    );
    writeMenuToFile(updatedMenu)
    res.json(updatedMenu)
});

// Remove menu item
app.post('/menu/remove', (req, res) => {
    const { id } = req.body
    const menu = readMenuFromFile()
    const updatedMenu = menu.filter(item => item.id !== id)
    writeMenuToFile(updatedMenu)
    res.json({ message: 'Item removed successfully' })
});


// Ruta para crear un nuevo pedido
app.post('/orders/add', (req, res) => {
    const order = req.body
    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Si el archivo no existe, crearlo con el nuevo pedido
                const initialOrders = [order]
                fs.writeFile(ORDERS_FILE, JSON.stringify(initialOrders, null, 2), (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error creating order file' })
                    }
                    printTicket(order)
                    res.json('Order added!')
                });
                return;
            }
            return res.status(500).json({ error: 'Error reading orders file' })
        }
        try {
            const orders = JSON.parse(data)
            orders.push(order)
            fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error saving order' })
                }
                printTicket(order)
                res.json('Order added!')
            });
        } catch (parseError) {
            res.status(500).json({ error: 'Error parsing JSON data' })
        }
    });
});



// Funcion para imprimir
const printTicket = (order) => {
    device.open((err) => {
        if (err) {
            console.error('Error al abrir el dispositivo:', err)
            return;
        }

        printer
            .beep(2,4)
            .font('b')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text('La Casita Azul')
            .text('------------------------')
            .align('lt')
            .style('normal')
            .size(1, 1)
            .text(`Nombre: ${order.customerName}`)
            .text(`Dirección: ${order.address}`)
            .text(`Teléfono: ${order.phone}`)
            .text(`Método de Pago: ${order.paymentMethod}`)
            .align('ct')
            .text(`***${order.comments}***`)
            .text('-------------------------------');
            
            order.items.forEach(item => {
                printer.font('b')
                    .align('lt').text(`${item.product} - ${item.selectedOption}`)
                    .align('lt').text(`Unidades: ${item.quantity} x $${item.selectedPrice}`)
                    .text(' ')
                
                item.extras.forEach(extra => {
                    printer.align('lt').text(`Extra: ${extra.product}`)
                            .align('lt').text(`Unidades: ${item.quantity} x $${extra.price}`)
                });

                if (item.comments) {
                    printer.text(' ')
                            .text(`Comentarios: ${item.comments}`);
                }
                
                printer.text(' ')
                        .align('rt')
                        .text(`subtotal: $${item.finalPrice}`); 
                printer.text('-------------------------------'); 
            });

            if (order.discount) {
                printer.align('lt').text(`Descuento: ${order.discount}%`)
                       .text('-------------------------------');
            }

        printer
            .align('ct')
            .text('-------------------------------')
            .align('rt')
            .font('a')
            .text(`Total: $${order.totalPrice}`)
            .font('b')
            .align('ct')
            .text('------------------------')
            .text('¡Gracias por su compra!')
            .text('------------------------')
            .cut()
            .close();
    });
};

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});



