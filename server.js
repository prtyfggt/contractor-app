require('dotenv').config(); // 1. Load the secret passwords from your .env file
const express = require('express');
const { PrismaClient } = require('@prisma/client'); 
const { PrismaPg } = require('@prisma/adapter-pg'); // 2. Import the Prisma adapter
const { Pool } = require('pg'); // 3. Import the standard Postgres driver

const app = express();
const PORT = 3000;

// --- INITIALIZE THE DATABASE CONNECTION ---
// 4. Create the connection pool and pass it into the Prisma Client
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(express.json());

// Home Route
app.get('/', (req, res) => {
    res.send('The Contractor App backend is officially running for Ryan Freeman!');
});

// --- API ROUTES ---

// POST Route: Create a new Contractor (User)
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, phone } = req.body; 
        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                phone: phone
            }
        });
        res.status(201).json(newUser); 
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Could not create user" });
    }
});

// GET Route: Fetch all Contractors
app.get('/api/users', async (req, res) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
});

// POST Route: Create a new Client for Ryan
app.post('/api/clients', async (req, res) => {
    try {
        const { userId, name, street_address, city_state_zip, email } = req.body;
        
        const newClient = await prisma.client.create({
            data: {
                userId: userId, // This links him to Ryan (User #1)
                name: name,
                street_address: street_address,
                city_state_zip: city_state_zip,
                email: email
            }
        });
        res.status(201).json(newClient);
    } catch (error) {
        console.error(error);
        // If this fails, it's usually because userId 1 doesn't exist (but we know it does!)
        res.status(400).json({ error: "Could not create client." });
    }
});

// POST Route: Create a Project with Line Items
app.post('/api/projects', async (req, res) => {
    try {
        const { clientId, status, total_amount, lineItems } = req.body;

        const newProject = await prisma.project.create({
            data: {
                clientId: clientId,
                status: status,
                total_amount: total_amount,
                // This "create" inside a "create" is the nested write!
                line_items: {
                    create: lineItems 
                }
            },
            include: {
                line_items: true // This tells Prisma to send back the items so we can see them
            }
        });

        res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Could not create project." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Success! Your server is running at http://localhost:${PORT}`);
});