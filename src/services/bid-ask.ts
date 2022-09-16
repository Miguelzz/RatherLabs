import { Router } from 'express';
import { firstValueFrom } from 'rxjs';
import SubscribeBook, { mapBidAsk } from '../external-services/bitfinex/book';


const router = Router();

router.get('/:par', async (req, res) => {
    const par = req.params.par
    const book = await firstValueFrom(SubscribeBook.get(par).pipe(mapBidAsk))
    res.json(book);
})




export default router;