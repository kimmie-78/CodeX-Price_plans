function pricePlanApp() {
    return {
        pricePlans: [],
        currentPlan: {
            id: null,
            plan_name: '',
            call_price: 0,
            sms_price: 0
        },
        newPlan: {
            name: '',
            call_cost: 0,
            sms_cost: 0
        },
        updatePlan: {
            name: '',
            call_cost: 0,
            sms_cost: 0
        },
        planToUpdateOrDelete: null,
        actions: '',
        totalAmount: 0,

        async fetchPricePlans() {
            try {
                const response = await fetch('/api/price_plans');
                this.pricePlans = await response.json();
            } catch (error) {
                console.error('Error fetching price plans:', error);
            }
        },

        async createPlan() {
            try {
                const response = await fetch('/api/price_plan/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newPlan)
                });
                if (response.ok) {
                    this.fetchPricePlans();
                    this.newPlan = { name: '', call_cost: 0, sms_cost: 0 };
                }
            } catch (error) {
                console.error('Error creating plan:', error);
            }
        },

        async updatePlanDetails() {
            try {
                const response = await fetch('/api/price_plan/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: this.planToUpdateOrDelete,
                        ...this.updatePlan
                    })
                });
                if (response.ok) {
                    this.fetchPricePlans();
                    this.updatePlan = { name: '', call_cost: 0, sms_cost: 0 };
                }
            } catch (error) {
                console.error('Error updating plan:', error);
            }
        },

        async deletePlan() {
            try {
                await fetch('/api/price_plan/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: this.planToUpdateOrDelete })
                });
                this.fetchPricePlans();
                this.planToUpdateOrDelete = null;
            } catch (error) {
                console.error('Error deleting plan:', error);
            }
        },

        updateCurrentPlan() {
            const selectedPlan = this.pricePlans.find(plan => plan.id == this.currentPlan.id);
            if (selectedPlan) {
                this.currentPlan = {
                    id: selectedPlan.id,
                    plan_name: selectedPlan.plan_name,
                    call_price: selectedPlan.call_price,
                    sms_price: selectedPlan.sms_price
                };
            } else {
                this.currentPlan = { id: null, plan_name: '', call_price: 0, sms_price: 0 };
            }
        },

        async calculateTotal() {
            try {
                const response = await fetch('/api/phonebill', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        price_plan: this.currentPlan.plan_name,
                        actions: this.actions
                    })
                });
                const result = await response.json();
                this.totalAmount = (result.total || 0).toFixed(2); 
            } catch (error) {
                console.error('Error calculating total:', error);
            }
        },

        init() {
            this.fetchPricePlans();
        }
    }
}
