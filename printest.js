const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const USB = escpos.USB;
const device = new USB();
const printer = new escpos.Printer(device, { encoding: 'CP850' }); // Usamos CP850 para caracteres en español

const printTicket = (order) => {
    device.open((err) => {
        if (err) {
            console.error('Error al abrir el dispositivo:', err);
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
            .text('-------------------------------')
            .text('Pedido:')
            .text('-------------------------------');
            
            order.items.forEach(item => {
                printer.align('lt').text(item.product)
                       .align('rt').text(`$${item.price}`)
                       .align('lt'); 
    
                if (item.comments) {
                    printer.text(`Comentarios: ${item.comments}`);
                }
                
                item.extras.forEach(extra => {
                    printer.align('lt').text(`  Extra: ${extra.product}`)
                           .align('rt').text(`$${extra.price}`)
                           .align('lt'); 
                });
    
                printer.text('-------------------------------'); 
            });

        printer
            .align('ct')
            .text(`***${order.comments}***`)
            .text('-------------------------------')
            .align('rt')
            .text(`Total: $${order.totalPrice}`)
            .align('ct')
            .text('------------------------')
            .text('¡Gracias por su compra!')
            .text('------------------------')
            .cut()
            .close();
    });
};

// Ejemplo de uso:
const order = {
    customerName: 'Juan Pérez',
    address: 'Calle Falsa 123',
    phone: '555-1234',
    paymentMethod: 'Tarjeta de Crédito',
    comments: 'tpcar bocina papi',
    items: [
        { product: 'Hamburguesa LA CASITA ZULASDASDASDASDASDASDASD', price: 50.00, comments: 'Sin cebolla', extras: [{ product: 'Queso', price: 5.00 }] },
        { product: 'Papas Fritas', price: 20.00, comments: '', extras: [] },
        { product: 'Coca Cola', price: 15.00, comments: '', extras: [] }
    ],
    totalPrice: 165.00
};

printTicket(order);
