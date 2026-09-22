import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Client Lazy Initialization
const supabaseUrl = process.env.SUPABASE_URL || 'https://tbokjiwhxqaqgcemtjzd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_tKgFiV4syg5hjpFqQrVEXQ_GW7QsdyU';

let supabaseClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are missing');
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

// Authentication Middleware
async function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }

    (req as any).user = user;
    next();
  } catch (err: any) {
    console.error('Auth verification error:', err);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
}

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    supabaseConnected: Boolean(supabaseUrl && supabaseKey),
    timestamp: new Date().toISOString(),
  });
});

// Auth: Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const supabase = getSupabase();
    
    // Create user via Admin API with pre-confirmed email for immediate frictionless login
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: { name: name.trim() },
    });

    if (createError) {
      return res.status(400).json({ error: createError.message });
    }

    // Sign in to obtain session access token
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (loginError || !sessionData.session) {
      return res.status(400).json({ error: loginError?.message || 'Account created but sign in failed' });
    }

    const user = sessionData.user;
    return res.json({
      user: {
        id: user.id,
        name: user.user_metadata?.name || name,
        email: user.email,
        createdAt: new Date(user.created_at).getTime(),
      },
      token: sessionData.session.access_token,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Server error during sign up' });
  }
});

// Auth: Log In
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (error || !data.session) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = data.user;
    return res.json({
      user: {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        createdAt: new Date(user.created_at).getTime(),
      },
      token: data.session.access_token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Server error during login' });
  }
});

// Auth: Demo Login
app.post('/api/auth/demo', async (req, res) => {
  try {
    const supabase = getSupabase();
    const demoEmail = 'alex.rivera@minimalist.io';
    const demoPassword = 'Password123!';

    // Try signing in
    let { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    // If demo user does not exist yet, create it
    if (signInError || !sessionData?.session) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { name: 'Alex Rivera' },
      });

      if (createError && !createError.message.includes('already registered')) {
        return res.status(500).json({ error: createError.message });
      }

      // Retry sign in
      const retry = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (retry.error || !retry.data.session) {
        return res.status(500).json({ error: 'Failed to authenticate demo user' });
      }
      sessionData = retry.data;
    }

    const user = sessionData.user;
    return res.json({
      user: {
        id: user.id,
        name: user.user_metadata?.name || 'Alex Rivera',
        email: user.email,
        createdAt: new Date(user.created_at).getTime(),
      },
      token: sessionData.session.access_token,
    });
  } catch (err: any) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: err.message || 'Failed to sign in demo user' });
  }
});

// Auth: Get Current User profile
app.get('/api/auth/me', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  res.json({
    user: {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      createdAt: new Date(user.created_at).getTime(),
    },
  });
});

// Tasks: List Tasks for current user
app.get('/api/tasks', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const supabase = getSupabase();

    const { data: rows, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const tasks = (rows || []).map((row) => ({
      id: row.id,
      text: row.text,
      completed: Boolean(row.completed),
      category: row.category || 'personal',
      priority: row.priority || 'medium',
      createdAt: new Date(row.created_at).getTime(),
    }));

    res.json({ tasks });
  } catch (err: any) {
    console.error('List tasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// Tasks: Create a new Task
app.post('/api/tasks', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const { text, category, priority } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Task text cannot be empty' });
    }

    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        text: text.trim(),
        completed: false,
        category: category || 'personal',
        priority: priority || 'medium',
      })
      .select();

    if (error || !rows || rows.length === 0) {
      return res.status(400).json({ error: error?.message || 'Failed to create task' });
    }

    const row = rows[0];
    res.status(201).json({
      task: {
        id: row.id,
        text: row.text,
        completed: Boolean(row.completed),
        category: row.category,
        priority: row.priority,
        createdAt: new Date(row.created_at).getTime(),
      },
    });
  } catch (err: any) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Tasks: Update an existing Task
app.put('/api/tasks/:id', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { text, completed, category, priority } = req.body;

    const updates: Record<string, any> = {};
    if (text !== undefined) updates.text = text.trim();
    if (completed !== undefined) updates.completed = Boolean(completed);
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;

    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error || !rows || rows.length === 0) {
      return res.status(400).json({ error: error?.message || 'Task not found or update failed' });
    }

    const row = rows[0];
    res.json({
      task: {
        id: row.id,
        text: row.text,
        completed: Boolean(row.completed),
        category: row.category,
        priority: row.priority,
        createdAt: new Date(row.created_at).getTime(),
      },
    });
  } catch (err: any) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Tasks: Delete a Task
app.delete('/api/tasks/:id', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const supabase = getSupabase();
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Tasks: Clear all completed tasks for user
app.post('/api/tasks/clear-completed', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', user.id)
      .eq('completed', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Clear completed error:', err);
    res.status(500).json({ error: 'Failed to clear completed tasks' });
  }
});

// Tasks: Reset to initial sample tasks in Supabase
app.post('/api/tasks/reset-sample', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const supabase = getSupabase();

    // Clear existing tasks
    await supabase.from('tasks').delete().eq('user_id', user.id);

    // Seed default tasks
    const sampleItems = [
      { user_id: user.id, text: 'Review quarterly goals & deliverables', completed: false, category: 'work', priority: 'high' },
      { user_id: user.id, text: 'Schedule annual health checkup', completed: false, category: 'personal', priority: 'medium' },
      { user_id: user.id, text: '30-minute afternoon mindfulness walk', completed: true, category: 'daily', priority: 'low' },
      { user_id: user.id, text: 'Pay internet and utilities bill', completed: false, category: 'urgent', priority: 'high' },
    ];

    const { data: rows, error } = await supabase.from('tasks').insert(sampleItems).select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const tasks = (rows || []).map((row) => ({
      id: row.id,
      text: row.text,
      completed: Boolean(row.completed),
      category: row.category,
      priority: row.priority,
      createdAt: new Date(row.created_at).getTime(),
    }));

    res.json({ tasks });
  } catch (err: any) {
    console.error('Reset sample error:', err);
    res.status(500).json({ error: 'Failed to reset sample tasks' });
  }
});

// --- Vite Integration & SPA Fallback ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
