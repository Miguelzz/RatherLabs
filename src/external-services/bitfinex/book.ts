import { Observable } from 'rxjs'
import { iif, of, bufferCount, Subject } from 'rxjs'
import { map, filter, switchMap, timeout } from 'rxjs/operators';
import { State } from "../../models/state";
import Bitfinex from '.';


export class Book extends Bitfinex {

    public book$ = new Subject<State[]>()

    constructor(par: string) {
        super()
        this._bitfinex$.next({
            event: 'subscribe',
            channel: 'book',
            symbol: 't' + par
        });

        this._bitfinex$.pipe(
            timeout(4000),
            filter(Array.isArray),
            map(([_, state]) => state),
            filter(Array.isArray),
            switchMap(state => iif(() => Array.isArray(state[0]), state, of(state))),
            map<number[], State>(([price, count, amount]) => ({ par, price, count, amount })),
            filter(({ count }) => count != 0),
            bufferCount(20, 19),
        ).subscribe({
            next: book => this.book$.next(book),
            error: _ => {
                console.log(`Error al consultar ${par}`)
                this.book$.next([])
            }
        })

    }

}


export default class SubscribeBook {
    static _list = new Map<string, Observable<State[]>>()

    static get(par: string) {
        par = par.replace('-', '')

        if (!SubscribeBook._list.has(par)) {
            const book = new Book(par).book$
            SubscribeBook._list.set(par, book)
        }

        return SubscribeBook._list.get(par)!
    }

    static delete(par: string) {
        par = par.replace('-', '')
        SubscribeBook._list.delete(par)
    }
}


export const mapBidAsk = map((book: State[]) => {
    const bidList = book.filter(x => x.amount > 0)
        .sort((a, b) => a.price - b.price)

    const askList = book.filter(x => x.amount < 0)
        .sort((a, b) => b.price - a.price)
        .map(({ amount, ...rest }) => ({ ...rest, amount: Math.abs(amount) }))

    return { bidList, askList }

})


export const getQuantity = (quantity: number) => map((book: State[]) => {

    const sell = book.filter(x => x.amount > 0)
        .map(x => ({ ...x, amount: Math.abs(x.amount) }))
        .map(({ price, amount }) => price * amount)
        .filter(x => x > quantity)
        .sort((a, b) => a - b)
        .shift()

    // comprar
    const buy = book.filter(x => x.amount < 0)
        .map(x => ({ ...x, amount: Math.abs(x.amount) }))
        .map(({ price, amount }) => price * amount)
        .filter(x => x > quantity)
        .sort((a, b) => a - b)
        .shift()


    return { buy, sell }

})



