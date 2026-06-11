import { Router } from "express";
import { env } from "cloudflare:workers";

const router = Router();

router.get('/', async (req, res) => {
	const { isFeatured } = req.query;

	if (typeof isFeatured === 'string' && isFeatured !== 'true') {
		res.status(400).json({error: 'Invalid query parameter'});
	}

	const whereClause = isFeatured ? " WHERE name NOT LIKE 'keynote'" : '';

	const { results } = await env.tech_conference_db.prepare(`SELECT * FROM tracks${whereClause}`).all()
	res.json(results);
});

export default router;
