import { Router } from 'express';
import { firstValueFrom } from 'rxjs';
import SubscribeBook, { getQuantity } from '../external-services/bitfinex/book';

const router = Router();

router.get('/:par/:quantity', async (req, res) => {
    const par = req.params.par
    const quantity = Number(req.params.quantity)
    const buySell = await firstValueFrom(SubscribeBook.get(par).pipe(getQuantity(quantity)))
    res.json(buySell);
})



export default router;