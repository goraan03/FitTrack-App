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
}

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
           id,
           korisnickoIme,
           ime,
           prezime,
           blokiran,
           uloga
         FROM users
         WHERE uloga = 'trener'
         ORDER BY id ASC`
      )
      const trainers = rows.map(r => ({
        id:          r.id,
        username:    r.korisnickoIme,
        firstName:   r.ime,
        lastName:    r.prezime,
        fullName:    `${r.ime} ${r.prezime}`,
        blocked:     Boolean(r.blokiran),
        role:        r.uloga,
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
