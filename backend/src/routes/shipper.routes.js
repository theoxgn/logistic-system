const express = require('express');
const router = express.Router();
const ShipperClient = require('../services/ShipperClient');

const shipperClient = new ShipperClient(process.env.SHIPPER_API_KEY, true);

// Location Search
router.get('/location', async (req, res) => {
    try {
        const { keyword, admLevel } = req.query;
        const result = await shipperClient.searchLocation(keyword, admLevel);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check Shipping Cost
router.post('/shipping-cost', async (req, res) => {
    try {
        const { rateType = 'regular', ...data } = req.body;
        const result = await shipperClient.checkShippingCost(data, rateType);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Order
router.post('/orders', async (req, res) => {
    try {
        const result = await shipperClient.createOrder(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Order Details
router.get('/orders/:orderId', async (req, res) => {
    try {
        const result = await shipperClient.getOrderDetails(req.params.orderId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Pickup Timeslots
router.get('/pickup/timeslots', async (req, res) => {
    try {
        const { timezone = 'Asia/Jakarta' } = req.query;
        const result = await shipperClient.getPickupTimeslots(timezone);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Pickup Request
router.post('/pickup', async (req, res) => {
    try {
        const result = await shipperClient.createPickup(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel Pickup
router.patch('/pickup/cancel', async (req, res) => {
    try {
        const { pickupCode } = req.body;
        const result = await shipperClient.cancelPickup(pickupCode);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/label', async (req, res) => {
    try {
        const { id, type = 'LBL' } = req.body;
        
        if (!id || !Array.isArray(id) || id.length === 0) {
            return res.status(400).json({ 
                error: 'Order IDs must be provided as a non-empty array' 
            });
        }

        if (!['LBL', 'RCP'].includes(type)) {
            return res.status(400).json({ 
                error: 'Type must be either "LBL" for label or "RCP" for receipt' 
            });
        }

        const result = await shipperClient.getPrintDocument(id, type);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;