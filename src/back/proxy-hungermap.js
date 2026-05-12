import express from 'express';

const router = express.Router();

console.log('🍽️ HungerMap Proxy cargado');

router.get('/country/:iso3', async (req, res) => {
    try {
        const { iso3 } = req.params;
        const url = `https://api.hungermapdata.org/v2/iso3/${iso3}/countryIso3Data.json`;

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: `País no encontrado: ${iso3}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;