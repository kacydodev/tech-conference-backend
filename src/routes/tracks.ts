import {Router} from "express";
import {env} from "cloudflare:workers";

const router = Router();

router.get('/', async (_, res) => {
	const tracks = await env.tech_conference_db.prepare('SELECT * FROM tracks').all()
	res.json(tracks)
});

export default router;
