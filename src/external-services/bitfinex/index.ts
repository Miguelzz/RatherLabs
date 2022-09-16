import { webSocket, WebSocketSubject } from 'rxjs/webSocket'

export default class Bitfinex {

    protected _bitfinex$: WebSocketSubject<unknown>

    constructor() {
        this._bitfinex$ = webSocket({
            url: 'wss://api-pub.bitfinex.com/ws/2',
            WebSocketCtor: require('ws'),
        })
    }

    close() {
        this._bitfinex$.complete()
    }
}

