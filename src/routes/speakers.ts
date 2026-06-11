import {Router} from "express";

interface Env {
	tech_conference_db: D1Database;
}

const router = Router();

router.get('/', async (_, res) => {
	const env = process.env as unknown as Env;
	const speakers = await env.tech_conference_db.prepare('SELECT * FROM speakers').all();
	res.json(speakers);
});

export default router;
