const express = require('express');
const { body, param, validationResult } = require('express-validator');
const app = express();
const port = 3000;

const mariadb = require('mariadb');
const pool = mariadb.createPool({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'sample',
	port: 3306,
	connectionLimit: 5
});

const { swaggerUi, specs } = require('./swagger');

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//Validation
const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Retrieve a list of agents
 *     responses:
 *       200:
 *         description: A list of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

//Get all records from the agents table
app.get('/agents', async (req, res) => {
	let connect;
	try {
        	connect = await pool.getConnection();
        	const agentRows = await connect.query("SELECT * FROM agents");
		res.json(agentRows);
	} catch (err) {
		console.error(err);
		res.status(500).send('Error getting agents data');
	} finally {
		if (connect) connect.release();
	}
});

/**
 * @swagger
 * /agents/{id}:
 *   get:
 *     summary: Retrieve an agent by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The agent ID
 *     responses:
 *       200:
 *         description: An agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

//Get an agent by ID
app.get('/agents/:id', async (req, res) => {
        let connect;
        try {
                connect = await pool.getConnection();
                const id = req.params.id;
		const agentRows = await connect.query("SELECT * FROM agents WHERE AGENT_CODE = ?", [id]);
                res.json(agentRows);
        } catch (err) {
                console.error(err);
                res.status(500).send('Error getting agent data');
        } finally {
                if (connect) connect.release();
        }
});

/**
 * @swagger
 * /agents:
 *   post:
 *     summary: Create a new agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AGENT_CODE:
 *                 type: string
 *               AGENT_NAME:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               COMMISSION:
 *                 type: number
 *               PHONE_NO:
 *                 type: string
 *               COUNTRY:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agent created
 */

//Create a new agent
app.post('/agents', [
    body('AGENT_CODE').isString().trim().notEmpty().withMessage('AGENT_CODE is required'),
    body('AGENT_NAME').isString().trim().notEmpty().withMessage('AGENT_NAME is required'),
    body('WORKING_AREA').isString().trim().notEmpty().withMessage('WORKING_AREA is required'),
    body('COMMISSION').isFloat().withMessage('COMMISSION must be a number'),
    body('PHONE_NO').isString().trim().notEmpty().withMessage('PHONE_NO is required'),
    body('COUNTRY').isString().trim().notEmpty().withMessage('COUNTRY is required')], handleValidation, async(req, res) => {
	let connect;
	try {
		connect = await pool.getConnection();
		const { AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
		const result = await connect.query("INSERT INTO agents (AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY) VALUES (?,?,?,?,?,?)", [AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY]);
		res.status(201).json({ message: 'Agent created', agentId: result.insertId });
	} catch (err) {
		console.error(err);
		res.status(500).send('Error creating agent');
	} finally {
		if (connect) connect.release();
	}
});


/**
 * @swagger
 * /agents/{id}:
 *   put:
 *     summary: Update an existing agent by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AGENT_NAME:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               COMMISSION:
 *                 type: number
 *               PHONE_NO:
 *                 type: string
 *               COUNTRY:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent updated
 */

//Update an existing agent by ID
app.put('/agents/:id', [
    param('id').isInt().withMessage('ID must be an integer'),
    body('AGENT_NAME').isString().trim().notEmpty().withMessage('AGENT_NAME is required'),
    body('WORKING_AREA').isString().trim().notEmpty().withMessage('WORKING_AREA is required'),
    body('COMMISSION').isFloat().withMessage('COMMISSION must be a number'),
    body('PHONE_NO').isString().trim().notEmpty().withMessage('PHONE_NO is required'),
    body('COUNTRY').isString().trim().notEmpty().withMessage('COUNTRY is required')
], handleValidation,  async(req, res) => {
	let connect;
	try {
		connect = await pool.getConnection();
		const id = req.params.id;
		const { AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
		await connect.query("UPDATE agents SET AGENT_NAME = ?, WORKING_AREA = ?, COMMISSION = ?, PHONE_NO = ?, COUNTRY = ? WHERE AGENT_CODE = ?", [AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY, id]);
		res.json({ message: 'Agent updated' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Error updating agent');
	} finally {
		if (connect) connect.release();
	}
});

/**
 * @swagger
 * /agents/{id}:
 *   patch:
 *     summary: Partially update an existing agent by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AGENT_NAME:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               COMMISSION:
 *                 type: number
 *               PHONE_NO:
 *                 type: string
 *               COUNTRY:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent partially updated
 */

//Partially update an existing agent by ID
app.patch('/agents/:id', [
    param('id').isInt().withMessage('ID must be an integer'),
    body().custom(value => {
        const keys = ['AGENT_NAME', 'WORKING_AREA', 'COMMISSION', 'PHONE_NO', 'COUNTRY'];
        for (let key in value) {
            if (!keys.includes(key)) {
                throw new Error(`Invalid field: ${key}`);
            }
        }
        return true;
    })
], handleValidation,  async(req, res) => {
	let connect;
 	try {
        	connect = await pool.getConnection();
        	const id = req.params.id;
        	const updates = req.body;
		const updateKeys = Object.keys(updates);
		const updateValues = Object.values(updates);
		const setClause = updateKeys.map(key => `${key} = ?`).join(', ');
		await connect.query(`UPDATE agents SET ${setClause} WHERE AGENT_CODE = ?`, [...updateValues, id]);
		res.json({ message: 'Agent partially updated' });
	} catch (err) {
		console.error(err);
	 	res.status(500).send('Error partially updating agent');
	} finally {
        	if (connect) connect.release();
	}
});

/**
 * @swagger
 * /agents/{id}:
 *   delete:
 *     summary: Delete an agent by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The agent ID
 *     responses:
 *       200:
 *         description: Agent deleted
 */

// Delete an agent by ID
app.delete('/agents/:id', [
    param('id').isInt().withMessage('ID must be an integer')
], handleValidation,  async (req, res) => {
	let connect;
	try {
		connect = await pool.getConnection();
		const id = req.params.id;
		await connect.query("DELETE FROM agents WHERE AGENT_CODE = ?", [id]);
		res.json({ message: 'Agent deleted' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Error deleting agent');
	} finally {
		if (connect) connect.release();
	}
});

/**
 * @swagger
 * /agent_cust/{id}:
 *   get:
 *     summary: Get a list of agent's customers by agent ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The agent ID
 *     responses:
 *       200:
 *         description: A list of customers for the specified agent
 */

//Get a list of agents customers by agent ID
app.get('/agent_cust/:id', async (req, res) => {
        let connect;
        try {
                connect = await pool.getConnection();
                const id = req.params.id;
                const agentCustRows = await connect.query("SELECT * FROM customer WHERE AGENT_CODE = ?", [id]);
                res.json(agentCustRows);
        } catch (err) {
                console.error(err);
                res.status(500).send('Error getting agent customer data');
        } finally {
                if (connect) connect.release();
        }
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})
