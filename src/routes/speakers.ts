import {Router} from "express";
import {env} from "cloudflare:workers";

const router = Router();

router.get('/', async (req, res) => {
	const { isFeatured } = req.query;

	if (typeof isFeatured === 'string' && isFeatured !== 'true') {
		res.status(400).json({error: 'Invalid query parameter'});
	}

	const whereClause = isFeatured ? ' WHERE s.featured = 1' : '';

	const query = `
		SELECT s.id, s.name, s.role, s.avatar, s.company, t.title, tr.color
		FROM talks t
			     JOIN speakers s ON t.speaker_id = s.id
			     INNER JOIN tracks tr ON t.track_id = tr.id
			${whereClause}
	`
	const { results } = await env.tech_conference_db.prepare(query).all();
	res.json(results);
});

router.get('/:id', async (req,res) => {
	const { id } = req.params;
	const query = `
	SELECT s.id,
                       s.name,
                       s.role,
                       s.company,
                       s.avatar,
                       s.bio,
                       tr.color,
                       (SELECT json_group_array(
                                       json_object(
                                               'id', t.id,
                                               'title', t.title,
                                               'description', t.description,
                                               'location', t.location,
                                               'day', t.day,
                                               'start_time', t.start_time,
                                               'end_time', t.end_time,
                                               'track', tr.name,
                                               'color', tr.color
                                       )
                               )
                        FROM talks t
                                 JOIN tracks tr ON t.track_id = tr.id
                        WHERE t.speaker_id = s.id) AS talks
                FROM speakers s JOIN talks t ON s.id = t.speaker_id JOIN tracks tr ON t.track_id = tr.id
                WHERE s.id = ?
	`
	const speaker = await env.tech_conference_db.prepare(query).bind(id).first();
	res.json(speaker);
})

export default router;
