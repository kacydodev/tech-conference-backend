import {Router} from "express";
import {env} from "cloudflare:workers";
import speakers from "./speakers";
import tracks from "./tracks";
import talks from "./talks";

// export interface Env {
// 	tech_conference_db: D1Database;
// }

const router = Router();

router.use('/api/v1/speakers', speakers);
router.use('/api/v1/tracks', tracks);
router.use('/api/v1/talks', talks);

router.get('/api/v1/conference', async (_, res) => {
    const conference = await env.tech_conference_db.prepare('SELECT * FROM conference').first();
    res.json(conference);
});

router.get('/api/v1/keynote', async (_, res) => {
	const keynote = await env.tech_conference_db.prepare(`
		SELECT s.name,
		       s.role,
		       s.company,
		       s.avatar,
		       t.title,
		       t.start_time,
		       t.day,
		       t.location
		FROM talks t
			     JOIN speakers s ON t.speaker_id = s.id
		LIMIT 1
	`).all();
	res.json(keynote);
})

export default router;

