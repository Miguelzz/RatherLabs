
import { iif, of, bufferCount, Subscription, Subject, catchError } from 'rxjs'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import { map, filter, switchMap, timeout } from 'rxjs/operators';

export interface State {
    par: string;
    price: number;
    count: number;
    amount: number;
}



class Subscribers {
    private list: {
        [key: string]: Subject<State[]>
    } = {}

    getPar = (par: string) => {
        par = par.replace('-', '')
        if (!this.list[par]) this.list[par] = new Subject<State[]>()
        return this.list[par]
    }
}

export const subscribers = new Subscribers()

export class Bitfinex {

    private booksSub$: Subscription = of().subscribe()
    public bitfinex$: WebSocketSubject<unknown>


    constructor(par: string) {
        par = par.replace('-', '')

        this.bitfinex$ = webSocket({
            url: 'wss://api-pub.bitfinex.com/ws/2',
            WebSocketCtor: require('ws'),
        })

        this.booksSub$ = this.bitfinex$.pipe(
            timeout(4000),
            filter(Array.isArray),
            map(([_, state]) => state),
            filter(Array.isArray),
            switchMap(state => iif(() => Array.isArray(state[0]), state, of(state))),
            map<number[], State>(([price, count, amount]) => ({ par, price, count, amount })),
            bufferCount(20, 19),
        ).subscribe({
            next: (x) => subscribers.getPar(par).next(x),
            error: () => subscribers.getPar(par).next([])
        })

        this.bitfinex$.next({
            event: 'subscribe',
            channel: 'book',
            symbol: 't' + par
        });

    }



    close() {
        this.booksSub$.unsubscribe()
        this.bitfinex$.complete()
    }

}

