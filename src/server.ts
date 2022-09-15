import * as express from "express";
import * as http from "http";
import { Server } from "socket.io";


import path from 'path';
import bidAskRoute from './services/bid-ask'
import buySellRoute from './services/buy-sell'

import './external-services/bitfinex'
import { Bitfinex, subscribers } from "./external-services/bitfinex";

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
        socket.data.bidAsk = subscribers.getPar(par)
            .subscribe((x) => {
                socket.emit('bid-ask', x)
            })
    });

    socket.on("buy-sell", (par) => {
        socket.data.buySell?.unsubscribe()
        socket.data.buySell = subscribers.getPar(par)
            .subscribe((x) => {
                socket.emit('buy-sell', x)
            })
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.data.bidAsk?.unsubscribe()
        socket.data.buySell?.unsubscribe()

    });

});


server.listen(3000, () => {
    new Bitfinex('BTC-USD')
    new Bitfinex('ETH-USD')
    console.log(
        `Server running on http://localhost:3000/`
    )
});