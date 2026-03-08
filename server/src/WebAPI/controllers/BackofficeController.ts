import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2/promise'
import db from '../../Database/connection/DbConnectionPool'

type TrainerRow = RowDataPacket & {
  id: number
  korisnickoIme: string
  ime: string
  prezime: string
  blokiran: number
  uloga: string
  billing_anchor_date: Date | null
  trial_ends_at: Date | null
  billing_status: string | null
  current_plan_id: number | null
  plan_name: string | null
  plan_price_eur: number | string | null
  plan_price_rsd: number | string | null
  plan_tier: number | null
}

const EUR_TO_RSD = 117

const BACKOFFICE_KEY = process.env.BACKOFFICE_API_KEY ?? ''

function verifyKey(req: Request, res: Response): boolean {
  const key = req.headers['x-backoffice-key']
  if (!key || key !== BACKOFFICE_KEY) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

export class BackofficeController {
  // GET /api/backoffice/trainers
  // Vraća sve trenere sa osnovnim podacima
  async getTrainers(req: Request, res: Response) {
    if (!verifyKey(req, res)) return
    try {
      const [rows] = await db.query<TrainerRow[]>(
        `SELECT 
           u.id,
           u.korisnickoIme,
           u.ime,
           u.prezime,
           u.blokiran,
           u.uloga,
           u.billing_anchor_date,
           u.trial_ends_at,
           u.billing_status,
           u.current_plan_id,
           p.name  as plan_name,
           p.price_eur  as plan_price_eur,
           p.price_rsd  as plan_price_rsd,
           p.tier  as plan_tier
         FROM users u
         LEFT JOIN plans p ON p.id = u.current_plan_id
         WHERE u.uloga = 'trener'
         ORDER BY u.id ASC`
      )
      const trainers = rows.map(r => ({
        id:          r.id,
        username:    r.korisnickoIme,
        firstName:   r.ime,
        lastName:    r.prezime,
        fullName:    `${r.ime} ${r.prezime}`,
        blocked:     Boolean(r.blokiran),
        role:        r.uloga,
        billing_anchor_date: r.billing_anchor_date ? new Date(r.billing_anchor_date).getDate() : null,
        trial_ends_at:       r.trial_ends_at ? new Date(r.trial_ends_at).toISOString() : null,
        billing_status:      r.billing_status ?? null,
        current_plan: r.current_plan_id && r.plan_name ? {
          id:   r.current_plan_id,
          name: r.plan_name,
          price_rsd: Number(r.plan_price_rsd ?? 0) > 0
            ? Number(r.plan_price_rsd)
            : Number(r.plan_price_eur ?? 0) * EUR_TO_RSD,
          tier: r.plan_tier ?? null,
        } : null,
        // paymentReference koji backoffice koristi za CSV matching
        paymentReference: `FT-${r.korisnickoIme.toUpperCase()}`,
      }))
      res.json({ trainers, count: trainers.length })
    } catch (err) {
      console.error('[Backoffice] getTrainers error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // POST /api/backoffice/block
  // Body: { trainerId: number, blocked: boolean, reason?: string }
  async setBlock(req: Request, res: Response) {
    if (!verifyKey(req, res)) return
    const { trainerId, blocked, reason } = req.body
    if (typeof trainerId !== 'number' || typeof blocked !== 'boolean') {
      return res.status(400).json({ error: 'trainerId (number) i blocked (boolean) su obavezni' })
    }
    try {
      const [result] = await db.query<any>(
        `UPDATE users SET blokiran = ? WHERE id = ? AND uloga = 'trener'`,
        [blocked ? 1 : 0, trainerId]
      )
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Trener nije pronađen' })
      }

      // Audit log u FitTrack bazi
      await db.query(
        `INSERT INTO audit_log (category, action, user_id, details)
         VALUES ('Upozorenje', ?, ?, ?)`,
        [
          blocked ? 'BACKOFFICE_BLOCK' : 'BACKOFFICE_UNBLOCK',
          trainerId,
          JSON.stringify({ blocked, reason: reason ?? 'Backoffice billing action' })
        ]
      )

      res.json({ ok: true, trainerId, blocked })
    } catch (err) {
      console.error('[Backoffice] setBlock error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // GET /api/backoffice/trainer/:id/status
  // Vraća trenutni status blokiranosti (za debug)
  async getTrainerStatus(req: Request, res: Response) {
    if (!verifyKey(req, res)) return
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
    try {
      const [rows] = await db.query<any[]>(
        `SELECT id, korisnickoIme, ime, prezime, blokiran FROM users WHERE id = ? AND uloga = 'trener'`,
        [id]
      )
      if (!rows.length) return res.status(404).json({ error: 'Nije pronađen' })
      const r = rows[0]
      res.json({ id: r.id, username: r.korisnickoIme, fullName: `${r.ime} ${r.prezime}`, blocked: Boolean(r.blokiran) })
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

    // GET /api/backoffice/metrics
    // Backoffice poziva ovo
    async getMetrics(req: Request, res: Response) {
        if (!verifyKey(req, res)) return
        try {
            const [[trainers]] = await db.query<any[]>(
                `SELECT COUNT(*) as cnt FROM users WHERE uloga='trener' AND blokiran=0`
            )
            const [[blockedTrainers]] = await db.query<any[]>(
                `SELECT COUNT(*) as cnt FROM users WHERE uloga='trener' AND blokiran=1`
            )
            const [[clients]] = await db.query<any[]>(
                `SELECT COUNT(*) as cnt FROM users WHERE uloga='klijent'`
            )
            const [[sessionsThisMonth]] = await db.query<any[]>(
                `SELECT COUNT(*) as cnt FROM workout_sessions 
                WHERE MONTH(start_time) = MONTH(CURDATE()) 
                AND YEAR(start_time) = YEAR(CURDATE())`
            )
            const [[enrollmentsThisMonth]] = await db.query<any[]>(
                `SELECT COUNT(*) as cnt FROM training_enrollments 
                WHERE MONTH(created_at) = MONTH(CURDATE()) 
                AND YEAR(created_at) = YEAR(CURDATE())`
            )

            res.json({
                date: new Date().toISOString().slice(0, 10),
                activeUsers: trainers.cnt + clients.cnt,
                usersByRole: {
                    trener:         trainers.cnt,
                    trener_blokiran: blockedTrainers.cnt,
                    klijent:        clients.cnt,
                },
                revenueEvents: [
                    {
                        type:  'workout_sessions_this_month',
                        count: sessionsThisMonth.cnt,
                        amount: 0,
                    },
                    {
                        type:  'enrollments_this_month',
                        count: enrollmentsThisMonth.cnt,
                        amount: 0,
                    },
                ],
                notes: `Auto-pull ${new Date().toISOString().slice(0, 10)}`,
            })
        } catch (err) {
            console.error('[Backoffice] getMetrics error:', err)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}
