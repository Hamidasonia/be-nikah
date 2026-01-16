import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

// 1. Middleware CORS (Mencegah Error CORS Policy)
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
}))

// Inisialisasi Supabase
const supabase = (c: any) => createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

// --- ROUTES ---

// 2. Route Config (Wajib ada agar guest.js tidak error)
app.get('/v2/config', (c) => {
  return c.json({
    status: true,
    data: {
      is_comment: true,
      is_confetti: true
    }
  })
})

app.post('/session', async (c) => {
  return c.json({ status: true, message: 'Login Berhasil' })
})

// Endpoint untuk mengambil komentar
app.get('/v2/comment', async (c) => {
  const { data, error } = await supabase(c)
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) return c.json({ status: false, message: error.message }, 500)
  return c.json({ status: true, data })
})

// Endpoint untuk mengirim komentar
app.post('/comment', async (c) => {
  try {
    const body = await c.req.json()
    // Menyesuaikan field dengan database (nama, komentar, presensi)
    const { data, error } = await supabase(c)
      .from('comments')
      .insert([{
        name: body.name,
        comment: body.comment,
        presence: body.presence
      }])
      .select()

    if (error) return c.json({ status: false, message: error.message }, 500)
    return c.json({ status: true, data: data[0] })
  } catch (err) {
    return c.json({ status: false, message: 'Invalid JSON' }, 400)
  }
})

// Handler untuk Vercel
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const OPTIONS = handle(app) // Wajib untuk Preflight request
export default handle(app)