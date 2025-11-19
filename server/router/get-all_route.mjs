import { Router } from 'express';
import { getAllOffices, getAllRoles, getAllCategories, getAllOperators } from '../dao.mjs';

const router = Router();

// GET /api/offices -> all default offices
router.get('/offices', async (req, res) => {
  try {
    const offices = await getAllOffices();
    res.status(200).json(offices);
  } catch (err) {
    res.status(503).json({ error: 'Database error during office retrieval' });
  }
});

//GET /api/roles -> all roles
router.get('/roles', async (req, res) => {
  try{
  const roles = await getAllRoles();
  res.status(200).json(roles);
  }catch (err) {
    res.status(503).json({ error: 'Database error during role retrieval' });
  }
});

// GET /api/categories -> all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (err) {
    res.status(503).json({ error: 'Database error during category retrieval' });
  }
});


// GET /api/admin - Get all (and only) operators
router.get('/admin', async (req, res) => {
  try {

    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const users = await getAllOperators();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
