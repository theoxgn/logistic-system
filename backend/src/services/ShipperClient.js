const axios = require('axios');

class ShipperClient {
    constructor(apiKey, isSandbox = true) {
        this.apiKey = apiKey;
        this.baseUrl = isSandbox 
            ? 'https://merchant-api-sandbox.shipper.id' 
            : 'https://merchant-api.shipper.id';
        
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    // Location Methods
    async searchLocation(keyword, admLevel = null) {
        try {
            const params = { keyword };
            if (admLevel) params.adm_level = admLevel;
            
            const response = await this.client.get('/v3/location', { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Pricing Methods
    async checkShippingCost(data, rateType = 'regular') {
        try {
            const response = await this.client.post(`/v3/pricing/domestic/${rateType}`, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Order Methods
    async createOrder(orderData) {
        try {
            const response = await this.client.post('/v3/order', orderData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getOrderDetails(orderId) {
        try {
            const response = await this.client.get(`/v3/order/${orderId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Pickup Methods
    async getPickupTimeslots(timezone = 'Asia/Jakarta') {
        try {
            const response = await this.client.get('/v3/pickup/timeslot', {
                params: { time_zone: timezone }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createPickup(pickupData) {
        try {
            const response = await this.client.post('/v3/pickup/timeslot', pickupData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async cancelPickup(pickupCode) {
        try {
            const response = await this.client.patch('/v3/pickup/cancel', { pickup_code: pickupCode });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getPrintDocument(orderIds, type = 'LBL') {
        try {
            const response = await this.client.post('/v3/order/label', {
                id: Array.isArray(orderIds) ? orderIds : [orderIds],
                type: type // 'LBL' for label or 'RCP' for receipt
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
    
    handleError(error) {
        if (error.response) {
            const { data, status } = error.response;
            return {
                status,
                message: data.metadata?.errors?.[0]?.message || 'API Error',
                data: data
            };
        }
        return {
            status: 500,
            message: error.message,
            data: null
        };
    }
}

module.exports = ShipperClient;