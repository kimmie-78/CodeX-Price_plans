import express from 'express';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
const PORT = process.env.PORT || 4011;

const dbPromise = sqlite.open({
    filename: './data_plan.db',
    driver: sqlite3.Database
});

(async () => {
    const db = await dbPromise;

    // Run migrations
    await db.migrate();

    //await db.run('ALTER TABLE price_plan ADD COLUMN total REAL DEFAULT 0');

    // Return a list of all the available price plans
    app.get('/api/price_plans', async (req, res) => {
        try {
            const plans = await db.all('SELECT * FROM price_plan');
            res.json(plans);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve price plans' });
        }
    });

    // Create a new price plan
    app.post('/api/price_plan/create', async (req, res) => {
        const { name, call_cost, sms_cost } = req.body;
        try {
            // Check if the plan name already exists
            const existingPlan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', [name]);
            if (existingPlan) {
                return res.status(400).json({ error: 'Price plan already exists' });
            }
    
            const result = await db.run(
                'INSERT INTO price_plan (plan_name, sms_price, call_price, total) VALUES (?, ?, ?, ?)',
                [name, sms_cost, call_cost, 0]  // Initialize total to 0
            );
            res.status(201).json({ id: result.lastID });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create price plan' });
        }
    });
    
    app.post('/api/price_plan/update', async (req, res) => {
        const { id, name, call_cost, sms_cost } = req.body;
        try {
            // Check for duplication by name, excluding the current plan's ID
            const existingPlan = await db.get('SELECT * FROM price_plan WHERE plan_name = ? AND id != ?', [name, id]);
            if (existingPlan) {
                return res.status(400).json({ error: 'Another price plan with the same name already exists' });
            }
    
            await db.run(
                'UPDATE price_plan SET plan_name = ?, sms_price = ?, call_price = ? WHERE id = ?',
                [name, sms_cost, call_cost, id]
            );
            res.status(200).json({ message: 'Price plan updated' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update price plan' });
        }
    });
    
    // Delete a price plan
    app.post('/api/price_plan/delete', async (req, res) => {
        const { id } = req.body;
        try {
            await db.run('DELETE FROM price_plan WHERE id = ?', [id]);
            res.status(200).json({ message: 'Price plan deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete price plan' });
        }
    });

    // Calculate the total phone bill based on selected price plan and actions
    app.post('/api/phonebill', async (req, res) => {
        const { price_plan, actions } = req.body;

        try {
            const plan = await db.get(
                'SELECT * FROM price_plan WHERE plan_name = ?',
                [price_plan]
            );
            if (!plan) {
                return res.status(404).json({ error: 'Price plan not found' });
            }

            const actionsArray = actions.split(',').map(action => action.trim());
            const total = actionsArray.reduce((acc, action) => {
                if (action === 'sms') {
                    return acc + plan.sms_price;
                } else if (action === 'call') {
                    return acc + plan.call_price;
                } else {
                    return acc;
                }
            }, 0);

            // Update total in the database
            await db.run(
                'UPDATE price_plan SET total = ? WHERE plan_name = ?',
                [total, price_plan]
            );

            res.json({ total });
        } catch (error) {
            res.status(500).json({ error: 'Failed to calculate phone bill' });
        }
    });

    // List totals for each price plan
    app.get('/api/price_plans/totals', async (req, res) => {
        try {
            const plans = await db.all('SELECT * FROM price_plan');
            res.json(plans.map(plan => ({
                plan_name: plan.plan_name,
                total: plan.total || 0
            })));
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve price plan totals' });
        }
    });

    // Find the most and least spent price plans
    app.get('/api/price_plans/most_least_spent', async (req, res) => {
        try {
            const plans = await db.all('SELECT * FROM price_plan');
            if (plans.length === 0) {
                return res.status(404).json({ error: 'No plans available' });
            }

            const mostSpent = plans.reduce((prev, curr) => (curr.total > prev.total ? curr : prev));
            const leastSpent = plans.reduce((prev, curr) => (curr.total < prev.total ? curr : prev));

            res.json({
                mostSpent: { plan_name: mostSpent.plan_name, total: mostSpent.total || 0 },
                leastSpent: { plan_name: leastSpent.plan_name, total: leastSpent.total || 0 }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to determine most and least spent plans' });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})();
