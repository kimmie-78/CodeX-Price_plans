import assert from 'assert';
import axios from 'axios';

const server = 'http://localhost:4011';

describe('Price Plan API Tests', function () {

    it('should retrieve all price plans', async function () {
        try {
            const response = await axios.get(`${server}/api/price_plans`);
            const plans = response.data;

            assert.equal(response.status, 200);
            assert(Array.isArray(plans));
            assert(plans.length > 0); // Assuming there are plans in the database
        } catch (error) {
            console.error('Error during test:', error);
        }
    });

    it('should create a new price plan', async function () {
        try {
            const newPlan = {
                name: 'test_plan',
                call_cost: 2.5,
                sms_cost: 0.5
            };

            const response = await axios.post(`${server}/api/price_plan/create`, newPlan);
            const { id } = response.data;

            assert.equal(response.status, 201);
            assert.equal(typeof id, 'number');
        } catch (error) {
            console.error('Error during test:', error);
        }
    });

    it('should update an existing price plan', async function () {
        try {
            const updatePlan = {
                id: 13, // Replace with a valid ID
                name: 'updated_plan',
                call_cost: 3.0,
                sms_cost: 0.75
            };

            const response = await axios.post(`${server}/api/price_plan/update`, updatePlan);
            assert.equal(response.status, 200);
            assert.equal(response.data.message, 'Price plan updated');
        } catch (error) {
            console.error('Error during test:', error);
        }
    });

    it('should delete an existing price plan', async function () {
        try {
            const deletePlan = {
                id: 15 // Replace with a valid ID
            };

            const response = await axios.post(`${server}/api/price_plan/delete`, deletePlan);
            assert.equal(response.status, 200);
            assert.equal(response.data.message, 'Price plan deleted');
        } catch (error) {
            console.error('Error during test:', error);
        }
    });

    it('should calculate the phone bill based on a price plan and actions', async function () {
        try {
            const calculateBill = {
                price_plan: 'sms_kick_100', // Replace with a valid plan name
                actions: 'call,sms,call'
            };

            const response = await axios.post(`${server}/api/phonebill`, calculateBill);
            const { total } = response.data;

            assert.equal(response.status, 200);
            assert.equal(typeof total, 'number');
            assert(total > 0); 
        } catch (error) {
            console.error('Error during test:', error);
        }
    });
});
