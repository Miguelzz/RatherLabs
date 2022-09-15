import { Router } from 'express';


const router = Router();

router.get('/', (req, res) => {
    res.json({
        "Title": "Hola mundo usando rutas!"
    });
})



export default router;