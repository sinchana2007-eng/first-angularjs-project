import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const requiredEnvironment = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
}

const app = express();
const port = Number(process.env.PORT || 3000);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const publicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

app.use(express.json({ limit: '32kb' }));
app.use((request, _response, next) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) request.body = {};
  next();
});

app.get('/', (_request, response) => {
  response.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.html'));
});

app.get('/vendor/angular.min.js', (_request, response) => {
  response.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'node_modules', 'angular', 'angular.min.js'));
});

app.use(express.static(publicDirectory));

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function fail(response, status, message) {
  return response.status(status).json({ error: message });
}

function requiredText(value, label, maxLength) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    return `${label} is required and must be at most ${maxLength} characters.`;
  }
  return null;
}

function optionalText(value, label, maxLength) {
  if (value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > maxLength)) {
    return `${label} must be at most ${maxLength} characters.`;
  }
  return null;
}

function validId(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validateBook(body) {
  return requiredText(body.title, 'Title', 200)
    || requiredText(body.author, 'Author', 160)
    || optionalText(body.isbn, 'ISBN', 32)
    || optionalText(body.category, 'Category', 80)
    || optionalText(body.publisher, 'Publisher', 160)
    || (body.total_copies === undefined || !Number.isInteger(Number(body.total_copies)) || Number(body.total_copies) < 1 || Number(body.total_copies) > 100000
      ? 'Total copies must be a whole number between 1 and 100000.'
      : null);
}

function validateMember(body) {
  const nameError = requiredText(body.name, 'Name', 160);
  if (nameError) return nameError;
  const emailError = requiredText(body.email, 'Email', 254);
  if (emailError) return emailError;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return 'Enter a valid email address.';
  return optionalText(body.phone, 'Phone', 40);
}

const bookFields = (body) => ({
  title: body.title.trim(),
  author: body.author.trim(),
  isbn: body.isbn?.trim() || null,
  category: body.category?.trim() || null,
  publisher: body.publisher?.trim() || null,
  total_copies: Number(body.total_copies),
});

const memberFields = (body) => ({
  name: body.name.trim(),
  email: body.email.trim().toLowerCase(),
  phone: body.phone?.trim() || null,
});

app.get('/api/health', asyncHandler(async (_request, response) => {
  const { error } = await supabase.from('books').select('id').limit(1);
  if (error) return fail(response, 503, `Supabase is unavailable: ${error.message}`);
  response.json({ status: 'ok' });
}));

app.get('/api/dashboard', asyncHandler(async (_request, response) => {
  const [booksResult, membersResult, loansResult] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('loans').select('id, due_date, returned_at, loan_date, book:books(id,title,author), member:members(id,name,email)').order('loan_date', { ascending: false }).limit(6),
  ]);
  const failure = booksResult.error || membersResult.error || loansResult.error;
  if (failure) return fail(response, 502, failure.message);

  const [activeResult, overdueResult] = await Promise.all([
    supabase.from('loans').select('id', { count: 'exact', head: true }).is('returned_at', null),
    supabase.from('loans').select('id', { count: 'exact', head: true }).is('returned_at', null).lt('due_date', new Date().toISOString().slice(0, 10)),
  ]);
  if (activeResult.error || overdueResult.error) return fail(response, 502, (activeResult.error || overdueResult.error).message);
  response.json({
    stats: {
      titles: booksResult.count,
      members: membersResult.count,
      onLoan: activeResult.count,
      overdue: overdueResult.count,
    },
    recentLoans: loansResult.data,
  });
}));

app.get('/api/books', asyncHandler(async (_request, response) => {
  const { data, error } = await supabase.from('books').select('*').order('title');
  if (error) return fail(response, 502, error.message);
  response.json(data);
}));

app.post('/api/books', asyncHandler(async (request, response) => {
  const validationError = validateBook(request.body);
  if (validationError) return fail(response, 400, validationError);
  const { data, error } = await supabase.from('books').insert({
    ...bookFields(request.body),
    available_copies: Number(request.body.total_copies),
  }).select().single();
  if (error) return fail(response, 400, error.message);
  response.status(201).json(data);
}));

app.put('/api/books/:id', asyncHandler(async (request, response) => {
  if (!validId(request.params.id)) return fail(response, 400, 'Invalid book ID.');
  const validationError = validateBook(request.body);
  if (validationError) return fail(response, 400, validationError);
  const { data, error } = await supabase.from('books').update(bookFields(request.body)).eq('id', request.params.id).select().maybeSingle();
  if (error) return fail(response, 400, error.message);
  if (!data) return fail(response, 404, 'Book not found.');
  response.json(data);
}));

app.delete('/api/books/:id', asyncHandler(async (request, response) => {
  if (!validId(request.params.id)) return fail(response, 400, 'Invalid book ID.');
  const { data, error } = await supabase.from('books').delete().eq('id', request.params.id).select('id').maybeSingle();
  if (error) return fail(response, 400, error.message);
  if (!data) return fail(response, 404, 'Book not found.');
  response.status(204).end();
}));

app.get('/api/members', asyncHandler(async (_request, response) => {
  const { data, error } = await supabase.from('members').select('*').order('name');
  if (error) return fail(response, 502, error.message);
  response.json(data);
}));

app.post('/api/members', asyncHandler(async (request, response) => {
  const validationError = validateMember(request.body);
  if (validationError) return fail(response, 400, validationError);
  const { data, error } = await supabase.from('members').insert(memberFields(request.body)).select().single();
  if (error) return fail(response, 400, error.message);
  response.status(201).json(data);
}));

app.put('/api/members/:id', asyncHandler(async (request, response) => {
  if (!validId(request.params.id)) return fail(response, 400, 'Invalid member ID.');
  const validationError = validateMember(request.body);
  if (validationError) return fail(response, 400, validationError);
  const { data, error } = await supabase.from('members').update(memberFields(request.body)).eq('id', request.params.id).select().maybeSingle();
  if (error) return fail(response, 400, error.message);
  if (!data) return fail(response, 404, 'Member not found.');
  response.json(data);
}));

app.delete('/api/members/:id', asyncHandler(async (request, response) => {
  if (!validId(request.params.id)) return fail(response, 400, 'Invalid member ID.');
  const { data, error } = await supabase.from('members').delete().eq('id', request.params.id).select('id').maybeSingle();
  if (error) return fail(response, 400, error.message);
  if (!data) return fail(response, 404, 'Member not found.');
  response.status(204).end();
}));

app.get('/api/loans', asyncHandler(async (_request, response) => {
  const { data, error } = await supabase
    .from('loans')
    .select('*, book:books(id,title,author), member:members(id,name,email)')
    .order('loan_date', { ascending: false });
  if (error) return fail(response, 502, error.message);
  response.json(data);
}));

app.post('/api/loans', asyncHandler(async (request, response) => {
  const { book_id: bookId, member_id: memberId, due_date: dueDate } = request.body;
  if (!validId(bookId) || !validId(memberId)) return fail(response, 400, 'Select a valid book and member.');
  const parsedDueDate = typeof dueDate === 'string' ? new Date(`${dueDate}T00:00:00Z`) : null;
  if (typeof dueDate !== 'string'
    || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)
    || !parsedDueDate
    || Number.isNaN(parsedDueDate.getTime())
    || parsedDueDate.toISOString().slice(0, 10) !== dueDate
    || dueDate < new Date().toISOString().slice(0, 10)) {
    return fail(response, 400, 'Due date must be today or later.');
  }
  const { data, error } = await supabase.rpc('checkout_book', {
    p_book_id: bookId,
    p_member_id: memberId,
    p_due_date: dueDate,
  });
  if (error) return fail(response, 400, error.message);
  response.status(201).json(data);
}));

app.post('/api/loans/:id/return', asyncHandler(async (request, response) => {
  if (!validId(request.params.id)) return fail(response, 400, 'Invalid loan ID.');
  const { data, error } = await supabase.rpc('return_book', { p_loan_id: request.params.id });
  if (error) return fail(response, 400, error.message);
  response.json(data);
}));

app.use('/api', (_request, response) => fail(response, 404, 'API endpoint not found.'));
app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') {
    return fail(response, 400, 'Request body must be valid JSON.');
  }
  console.error(error);
  if (response.headersSent) return;
  response.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(port, () => {
  console.log(`Bookwise is running at http://localhost:${port}`);
});
