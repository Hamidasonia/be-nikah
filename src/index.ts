import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

// Middleware CORS paling longgar agar tidak ada Network Error
app.use('/*', cors({
  origin: (origin) => origin, // Mengizinkan domain apapun yang memanggil
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'Accept'],
  credentials: true,
}))

const supabase = (c: any) => createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

// Endpoint config wajib untuk guest.js
app.get('/v2/config', (c) => {
  return c.json({
    status: true,
    data: { is_comment: true, is_confetti: true }
  })
})

app.get('/v2/comment', async (c) => {
  const { data } = await supabase(c).from('comments').select('*').order('created_at', { ascending: false })
  return c.json({ status: true, data: data || [] })
})

app.post('/comment', async (c) => {
  const body = await c.req.json()
  const { data } = await supabase(c).from('comments').insert([body]).select()
  return c.json({ status: true, data })
})

// Handler eksplisit untuk Vercel
export const GET = handle(app)
export const POST = handle(app)
export const OPTIONS = handle(app) 
export default handle(app)