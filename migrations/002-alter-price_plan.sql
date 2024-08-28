-- Add a new column 'total' to the 'price_plan' table
ALTER TABLE price_plan
ADD COLUMN total REAL DEFAULT 0;
