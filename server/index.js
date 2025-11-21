const express = require('express');
const cors = require('cors');
const Joi = require('joi');
const db = require('./models');
const cfg = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// Test DB connection and sync models (don't force in production)
(async ()=>{
  try {
    await db.sequelize.authenticate();
    console.log('Connected to DB');
    await db.sequelize.sync();
  } catch (err) { console.error('DB connection error', err); }
})();

// --- Validation schemas ---
const categorySchema = Joi.object({ name: Joi.string().min(1).required() });
const todoSchema = Joi.object({ title: Joi.string().min(1).required(), description: Joi.string().allow('', null), categoryId: Joi.number().allow(null), completed: Joi.boolean().optional() });

// --- Categories ---
app.get('/api/categories', async (req,res)=>{
  try{ const cats = await db.Category.findAll({ order:[['name','ASC']]}); res.json(cats); }catch(e){ res.status(500).json({error:e.message}); }
});

app.post('/api/categories', async (req,res)=>{
  const { error, value } = categorySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  try{ const cat = await db.Category.create({ name: value.name }); res.json(cat); }catch(e){ res.status(500).json({ error: e.message }); }
});

app.put('/api/categories/:id', async (req,res)=>{
  const id = Number(req.params.id);
  const { error, value } = categorySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  try{ const [cnt] = await db.Category.update({ name: value.name }, { where: { id } }); res.json({ updated: cnt }); }catch(e){ res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', async (req,res)=>{
  const id = Number(req.params.id);
  try{ const cnt = await db.Category.destroy({ where: { id } }); res.json({ deleted: cnt }); }catch(e){ res.status(500).json({ error: e.message }); }
});

// --- Todos ---
// GET with pagination and optional search by title
app.get('/api/todos', async (req,res)=>{
  try{
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page-1)*pageSize;
    const search = req.query.search ? req.query.search : null;

    const where = {};
    if (search) where.title = { [db.Sequelize.Op.iLike]: `%${search}%` };

    const { count, rows } = await db.Todo.findAndCountAll({ where, include: [{ model: db.Category, attributes: ['id','name'] }], order:[['createdAt','DESC']], limit: pageSize, offset });
    res.json({ total: count, page, pageSize, todos: rows });
  }catch(e){ res.status(500).json({ error: e.message }); }
});

app.post('/api/todos', async (req,res)=>{
  const { error, value } = todoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  try{ const todo = await db.Todo.create({ title: value.title, description: value.description || '', categoryId: value.categoryId || null }); const t = await db.Todo.findByPk(todo.id, { include: db.Category }); res.json(t); }catch(e){ res.status(500).json({ error: e.message }); }
});

app.put('/api/todos/:id', async (req,res)=>{
  const id = Number(req.params.id);
  const { error, value } = todoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  try{ const [cnt] = await db.Todo.update({ title: value.title, description: value.description || '', categoryId: value.categoryId || null, completed: !!value.completed }, { where: { id } }); res.json({ updated: cnt }); }catch(e){ res.status(500).json({ error: e.message }); }
});

app.patch('/api/todos/:id/toggle', async (req,res)=>{
  const id = Number(req.params.id);
  try{ const todo = await db.Todo.findByPk(id); if(!todo) return res.status(404).json({ error: 'Not found' }); todo.completed = !todo.completed; await todo.save(); res.json({ id: todo.id, completed: todo.completed }); }catch(e){ res.status(500).json({ error: e.message }); }
});

app.delete('/api/todos/:id', async (req,res)=>{
  const id = Number(req.params.id);
  try{ const cnt = await db.Todo.destroy({ where: { id } }); res.json({ deleted: cnt }); }catch(e){ res.status(500).json({ error: e.message }); }
});

// Serve static client build if present (optional)
const path = require('path');
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
// If client build exists, serve it
app.use(express.static(clientBuild));
app.get('*', (req,res)=>{ res.sendFile(path.join(clientBuild, 'index.html')); });

app.listen(cfg.port, ()=>console.log(`Server listening on http://localhost:${cfg.port}`));

