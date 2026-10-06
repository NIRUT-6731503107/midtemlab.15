import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. List equipment — GET /api/equipment
app.get('/api/equipment', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM equipment').all();
  return c.json(results, 200);
});

// 2. List bookings — GET /api/bookings
app.get('/api/bookings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM bookings').all();
  return c.json(results, 200);
});

// 3. Get one booking — GET /api/bookings/:id
app.get('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const booking = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  return c.json(booking, 200);
});

// Helper validation & collision check
async function validateBookingData(db: D1Database, body: any, currentBookingId?: string) {
  const { equipmentId, borrowerName, startAt, endAt, purpose } = body;

  if (!equipmentId || !borrowerName || !startAt || !endAt || !purpose) {
    return { status: 400, message: 'All fields (equipmentId, borrowerName, startAt, endAt, purpose) are required' };
  }

  // Validate startAt < endAt
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
    return { status: 400, message: 'startAt must be valid and before endAt' };
  }

  // Check if equipment exists
  const eq = await db.prepare('SELECT id FROM equipment WHERE id = ?').bind(equipmentId).first();
  if (!eq) {
    return { status: 400, message: `Equipment ID '${equipmentId}' does not exist` };
  }

  // Overlap check (excluding self during update)
  let query = `
    SELECT id FROM bookings 
    WHERE equipmentId = ? 
      AND (? < endAt AND ? > startAt)
  `;
  const params: any[] = [equipmentId, startAt, endAt];

  if (currentBookingId) {
    query += ' AND id != ?';
    params.push(currentBookingId);
  }

  const overlap = await db.prepare(query).bind(...params).first();
  if (overlap) {
    return { status: 409, message: 'Booking time overlaps with an existing reservation for this equipment' };
  }

  return null;
}

// 4. Create booking — POST /api/bookings
app.post('/api/bookings', async (c) => {
  try {
    const body = await c.req.json();
    const validationError = await validateBookingData(c.env.DB, body);
    if (validationError) {
      return c.json({ error: validationError.message }, validationError.status as any);
    }

    const id = `bk-${Date.now()}`;
    const { equipmentId, borrowerName, startAt, endAt, purpose } = body;

    await c.env.DB.prepare(
      'INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, equipmentId, borrowerName, startAt, endAt, purpose).run();

    const newBooking = { id, equipmentId, borrowerName, startAt, endAt, purpose };
    return c.json(newBooking, 201);
  } catch (err) {
    return c.json({ error: 'Invalid JSON request body' }, 400);
  }
});

// 5. Update booking — PATCH /api/bookings/:id
app.patch('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
  
  if (!existing) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  try {
    const body = await c.req.json();
    const validationError = await validateBookingData(c.env.DB, body, id);
    if (validationError) {
      return c.json({ error: validationError.message }, validationError.status as any);
    }

    const { equipmentId, borrowerName, startAt, endAt, purpose } = body;

    await c.env.DB.prepare(
      'UPDATE bookings SET equipmentId = ?, borrowerName = ?, startAt = ?, endAt = ?, purpose = ? WHERE id = ?'
    ).bind(equipmentId, borrowerName, startAt, endAt, purpose, id).run();

    const updatedBooking = { id, equipmentId, borrowerName, startAt, endAt, purpose };
    return c.json(updatedBooking, 200);
  } catch (err) {
    return c.json({ error: 'Invalid JSON request body' }, 400);
  }
});

// 6. Delete booking — DELETE /api/bookings/:id
app.delete('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();

  if (!existing) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run();
  return c.body(null, 204);
});

export default app;