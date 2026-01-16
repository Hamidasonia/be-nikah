import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

// Inisialisasi Supabase
const supabase = (c: any) => createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

// Rute sesuai Postman
app.post('/session', async (c) => {
  return c.json({ status: true, message: 'Login Berhasil' })
})

app.get('/v2/comment', async (c) => {
  const { data } = await supabase(c).from('comments').select('*')
  return c.json({ status: true, data })
})

app.post('/comment', async (c) => {
  const body = await c.req.json()
  const { data } = await supabase(c).from('comments').insert(body).select()
  return c.json({ status: true, data })
})

export const POST = handle(app)
export const GET = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export default handle(app)