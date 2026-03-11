require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const multer = require('multer'); 
const { createClient } = require('@supabase/supabase-js'); 

const app = express();
const PORT = 3000;

// 1. Database Connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Storage Connection
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

// 3. File Upload Middleware (Mailroom)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.send('Contractor App Backend is LIVE for Ryan Freeman!');
});

// Create Contractor (User)
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, phone, business_address } = req.body;
        const newUser = await prisma.user.create({
            data: { name, email, phone, business_address }
        });
        res.status(201).json(newUser);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// Create Client (e.g., Tyler Thomas)
app.post('/api/clients', async (req, res) => {
    try {
        const { userId, name, street_address, city_state_zip, email } = req.body;
        const newClient = await prisma.client.create({
            data: { userId, name, street_address, city_state_zip, email }
        });
        res.status(201).json(newClient);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// GET Route: Fetch all clients
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await prisma.client.findMany();
        res.json(clients);
    } catch (e) {
        res.status(500).json({ error: "Could not fetch clients." });
    }
});

// Create Project (The Estimate)
app.post('/api/projects', async (req, res) => {
    try {
        const { clientId, status, total_amount, lineItems } = req.body;
        const newProject = await prisma.project.create({
            data: { 
                clientId, 
                status, 
                total_amount, 
                line_items: { create: lineItems } 
            },
            include: { line_items: true }
        });
        res.status(201).json(newProject);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// NEW: Upload "Before/After" Photos
app.post('/api/projects/:projectId/images', upload.single('image'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { image_type } = req.body; 
        const file = req.file;

        if (!file) return res.status(400).json({ error: "No file uploaded" });

        // A. Upload file to Supabase Bucket
        const fileName = `${projectId}/${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
            .from('project-images')
            .upload(fileName, file.buffer, { contentType: file.mimetype });

        if (error) throw error;

        // B. Generate the Public link
        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);

        // C. Save the link to the specific Project
        const newImage = await prisma.projectImage.create({
            data: {
                projectId: parseInt(projectId),
                image_type: image_type,
                image_url: publicUrl
            }
        });

        res.status(201).json(newImage);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Upload failed" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Success! Your server is running at http://localhost:${PORT}`);
});