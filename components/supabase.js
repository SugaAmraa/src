// ── Supabase тохиргоо ─────────────────────────────────────────
const SUPABASE_URL = 'https://ecbzlkrvxomygcgcxlqc.supabase.co';   // 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYnpsa3J2eG9teWdjZ2N4bHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDg2MzAsImV4cCI6MjA4ODIyNDYzMH0.48mBSVRqdRBigFpSUZ5pShaxP8R3JLKrz5zx7tsQ9f8.48mBSVRqdRBigFpSUZ5pShaxP8R3JLKrz5zx7tsQ9f8';  // ← anon public key

// Supabase REST API helper
export const supabase = {
    url: SUPABASE_URL,
    headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },

    // SELECT
    async from(table) {
        return new QueryBuilder(SUPABASE_URL, this.headers, table);
    }
};

class QueryBuilder {
    constructor(url, headers, table) {
        this._url    = url;
        this._headers = headers;
        this._table  = table;
        this._params = [];
        this._method = 'GET';
        this._body   = null;
    }

    // WHERE col=val
    eq(col, val) {
        this._params.push(`${col}=eq.${encodeURIComponent(val)}`);
        return this;
    }

    // SELECT columns
    select(cols = '*') {
        this._cols = cols;
        return this;
    }

    // ORDER
    order(col, { ascending = true } = {}) {
        this._params.push(`order=${col}.${ascending ? 'asc' : 'desc'}`);
        return this;
    }

    // INSERT
    insert(data) {
        this._method = 'POST';
        this._body   = JSON.stringify(data);
        return this;
    }

    // UPDATE
    update(data) {
        this._method = 'PATCH';
        this._body   = JSON.stringify(data);
        return this;
    }

    // DELETE
    delete() {
        this._method = 'DELETE';
        return this;
    }

    // Execute
    async then(resolve, reject) {
        try {
            const cols = this._cols ? `select=${this._cols}` : 'select=*';
            const params = [cols, ...this._params].join('&');
            const url = `${this._url}/rest/v1/${this._table}?${params}`;

            const res = await fetch(url, {
                method: this._method,
                headers: this._headers,
                body: this._body
            });

            if (!res.ok) {
                const err = await res.json();
                return reject?.(err) ?? Promise.reject(err);
            }

            const data = res.status === 204 ? [] : await res.json();
            resolve({ data, error: null });
        } catch(e) {
            reject?.({ data: null, error: e });
        }
    }
}

// ── Хялбар helper функцүүд ────────────────────────────────────

export async function getProducts() {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) throw error;
    return data;
}

export async function addProduct(product) {
    const { data, error } = await (await supabase.from('products')).insert(product);
    if (error) throw error;
    return data[0];
}

export async function getUsers() {
    const { data, error } = await supabase.from('users').select('id,username,display_name,email,avatar,provider,is_admin,created_at');
    if (error) throw error;
    return data;
}

export async function getUserByEmail(email) {
    const { data, error } = await (await supabase.from('users')).eq('email', email).select('*');
    if (error) throw error;
    return data[0] || null;
}

export async function getUserByUsername(username) {
    const { data, error } = await (await supabase.from('users')).eq('username', username).select('id');
    if (error) throw error;
    return data[0] || null;
}

export async function createUser(user) {
    const { data, error } = await (await supabase.from('users')).insert(user);
    if (error) throw error;
    return data[0];
}