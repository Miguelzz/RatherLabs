import { Router } from 'express';
import { firstValueFrom } from 'rxjs';
import { subscribers } from '../external-services/bitfinex';


const router = Router();

router.get('/:par', async (req, res) => {
    const par = req.params.par.replace('-', '')
    const state = await firstValueFrom(subscribers.getPar(par))
    res.json(state);
})




export default router;