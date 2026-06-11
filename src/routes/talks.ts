import { Router } from "express";
import { env } from "cloudflare:workers";

const router = Router();

interface QueryParams {
	track_id?: string | string[];
	day?: string;
}

router.get('/', async (req: { query: QueryParams }, res) => {
	const { track_id, day } = req.query;

	function isValidDay(day: string) {
		return day === '1' || day === '2' || day === '3';
	}

	const params: string[] = []
	const condition: string[] = []

	if (typeof track_id === 'string') {
		params.push(track_id)
		condition.push('t.track_id = ?')
	}

	if (typeof track_id === 'object') {
		const placeholder = track_id.map((_) => "?").join(",");
		params.push(...track_id)
		condition.push(`t.track_id IN (${placeholder})`)
	}
	if (day && !isValidDay(day)) {
		res.status(400).json({ error: 'Invalid day parameter' });
		return;
	}

	if (typeof day === 'string' && isValidDay(day)) {
		condition.push('t.day = ?');
		params.push(day);
	}

	const whereClause = condition.length > 0 ? ` WHERE ${condition.join(' AND ')}` : '';

	const query = `
		SELECT t.id, t.speaker_id, t.track_id, t.title, t.description, t.day, t.location, t.start_time,
		       t.end_time, s.name, s.role, s.company, tr.name as track, tr.color
		FROM talks t
				 JOIN speakers s ON t.speaker_id = s.id
			     INNER JOIN tracks tr ON t.track_id = tr.id
	`
	const { results } = await env.tech_conference_db.prepare(query + whereClause).bind(...params).all()
	res.json(results);
});

export default router;
