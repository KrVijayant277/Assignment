import express from 'express';
import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_FILE = path.join(__dirname, '../logs.json');

// Helper function to read logs
async function readLogs() {
    try {
        const data = await fs.promises.readFile(LOGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, create it with empty structure
            const initialData = { items: [] };
            await fs.promises.writeFile(LOGS_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        throw error;
    }
}

// Helper function to write logs
async function writeLogs(logs) {
    try {
        await fs.promises.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
        console.log('Logs successfully written to:', LOGS_FILE);
    } catch (error) {
        console.error('Error writing logs:', error);
        throw error;
    }
}

// Create a new item
router.post('/', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        console.log("Processing new item creation");
        
        const newItem = await pool.query(
            'INSERT INTO items (name, description, price) VALUES ($1, $2, $3) RETURNING *',
            [name, description, price]
        );
        
        // Create metadata entry
        const metadata = {
            itemId: newItem.rows[0].id,
            timestamp: new Date().toISOString(),
            action: 'create',
            details: {
                name,
                description,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                userId: req.user.id,
                username: req.user.username
            }
        };
        
        console.log('Created metadata:', metadata);
        
        // Read current logs and append new metadata
        const logs = await readLogs();
        console.log('Current logs:', logs);
        
        logs.items.push(metadata);
        
        // Write updated logs back to file
        await writeLogs(logs);
        
        res.json(newItem.rows[0]);
    } catch (err) {
        console.error('Error creating item:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all items with pagination, sorting and filtering
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'ASC', filterKey, filterValue } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM items';
        const queryParams = [];
        console.log("get all items");
        
        // Add filtering if filterKey and filterValue are provided
        if (filterKey && filterValue) {
            query += ` WHERE ${filterKey} = $1`;
            queryParams.push(filterValue);
        }
        
        // Add sorting
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        
        // Add pagination
        query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);
        
        const items = await pool.query(query, queryParams);
        
        // Get total count for pagination
        const countQuery = filterKey && filterValue 
            ? `SELECT COUNT(*) FROM items WHERE ${filterKey} = $1`
            : 'SELECT COUNT(*) FROM items';
        const totalCount = await pool.query(countQuery, filterKey && filterValue ? [filterValue] : []);
        
        res.json({
            items: items.rows,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount.rows[0].count / limit),
            totalItems: parseInt(totalCount.rows[0].count)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get item by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const item = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
        console.log("get item by id");
        if (item.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json(item.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update item by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        console.log("update item by id");
        const item = await pool.query(
            'UPDATE items SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *',
            [name, description, price, id]
        );
        
        if (item.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json(item.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete item by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new route to get item metadata
router.get('/:id/metadata', async (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const logs = await readLogs();
        const itemLogs = logs.items.filter(log => log.itemId === itemId);
        
        if (itemLogs.length === 0) {
            return res.status(404).json({ error: 'No metadata found for this item' });
        }
        
        res.json(itemLogs);
    } catch (error) {
        console.error('Error fetching item metadata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 