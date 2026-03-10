// ── Supabase тохиргоо ────────────────────────────────────────
const SUPABASE_URL = 'https://ecbzlkrvxomygcgcxlqc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYnpsa3J2eG9teWdjZ2N4bHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDg2MzAsImV4cCI6MjA4ODIyNDYzMH0.48mBSVRqdRBigFpSUZ5pShaxP8R3JLKrz5zx7tsQ9f8';

const HEADERS = {
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=representation'
};

// ── Үндсэн fetch helper ──────────────────────────────────────
async function query(path, options = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        headers: HEADERS,
        ...options
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Supabase алдаа: ${res.status}`);
    }
    if (res.status === 204) return [];
    return res.json();
}

// ── snake_case → camelCase ────────────────────────────────────
function toUser(row) {
    if (!row) return null;
    return {
        id:           row.id,
        username:     row.username,
        displayName:  row.display_name,
        email:        row.email,
        passwordHash: row.password_hash,
        avatar:       row.avatar,
        provider:     row.provider,
        isAdmin:      row.is_admin,
        createdAt:    row.created_at
    };
}

// ── camelCase → snake_case ────────────────────────────────────
function toRow(user) {
    return {
        id:            user.id,
        username:      user.username,
        display_name:  user.displayName,
        email:         user.email,
        password_hash: user.passwordHash,
        avatar:        user.avatar,
        provider:      user.provider,
        is_admin:      user.isAdmin ?? false
    };
}

// ── PRODUCTS ─────────────────────────────────────────────────
export async function getProducts() {
    return query('products?select=*&order=name.asc');
}

export async function addProduct(product) {
    const data = await query('products', {
        method: 'POST',
        body: JSON.stringify(product)
    });
    return data[0];
}

// ── USERS ────────────────────────────────────────────────────
export async function getUsers() {
    const data = await query('users?select=*');
    return data.map(toUser);
}

export async function getUserByEmail(email) {
    const data = await query(`users?email=eq.${encodeURIComponent(email)}&select=*`);
    return toUser(data[0] || null);
}

export async function getUserByUsername(username) {
    const data = await query(`users?username=eq.${encodeURIComponent(username)}&select=id`);
    return data[0] || null;
}

export async function createUser(user) {
    const data = await query('users', {
        method: 'POST',
        body: JSON.stringify(toRow(user))
    });
    return toUser(data[0]);
}
