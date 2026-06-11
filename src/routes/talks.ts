import {Router} from "express";
import {env} from "cloudflare:workers";

const router = Router();

router.get('/', async (_, res) => {
	const talks = await env.tech_conference_db.prepare('SELECT * FROM talks').all()
	res.json(talks)
});

export default router;
