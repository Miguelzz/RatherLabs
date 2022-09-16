import * as express from "express";
import * as http from "http";
import { Server } from "socket.io";


import path from 'path';
import bidAskRoute from './services/bid-ask'
import buySellRoute from './services/buy-sell'


import SubscribeBook, { getQuantity, mapBidAsk } from "./external-services/bitfinex/book";


const app = express.default();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));
app.use('/api/bid-ask', bidAskRoute);
app.use('/api/buy-sell', buySellRoute);


app.get('/', function (_, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on('connection', function (socket) {
    console.log('Nuevo Usuario Conectado');

    socket.on("bid-ask", (par) => {
        socket.data.bidAsk?.unsubscribe()
        if (par != '')
            socket.data.bidAsk = SubscribeBook.get(par).pipe(mapBidAsk)
                .subscribe((x) => socket.emit("bid-ask", x))
    });

    socket.on("buy-sell", (par, quantity) => {
        socket.data.buySell?.unsubscribe()
        if (par != '')
            socket.data.buySell = SubscribeBook.get('BTC-USD')
                .pipe(getQuantity(quantity))
                .subscribe((x) => socket.emit("buy-sell", x))

    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.data.bidAsk?.unsubscribe()
        socket.data.buySell?.unsubscribe()
    });

});


server.listen(3000, () => {
    SubscribeBook.get('BTC-USD')
    SubscribeBook.get('ETH-USD')

    console.log(
        `Server running on http://localhost:3000/`
    )
});