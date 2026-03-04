import { getUsers, getUserByEmail, getUserByUsername, createUser } from './supabase.js';

export class PageLogin extends HTMLElement {
    constructor() {
        super();
        this.mode = 'login';
        // ⚠️ console.cloud.google.com-оос авсан Client ID-г энд тавина
        this.GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
    }

    connectedCallback() {
        this.renderPage();
    }

    renderPage() {
        this.innerHTML = `
            <div class="container" style="max-width:420px; margin-top:3rem; padding-bottom:3rem;">
                <div style="text-align:center; margin-bottom:2rem;">
                    <div style="font-size:3rem;">🌿</div>
                    <h2 style="margin-top:0.5rem;">Jorkhon-д тавтай морил</h2>
                    <p style="color:var(--color-text-muted); font-size:0.9rem; margin-top:0.3rem;">Эрүүл хоол, шинэ амт</p>
                </div>

                <div style="background:var(--color-surface); padding:2rem; border-radius:var(--radius); border:1px solid var(--color-border); box-shadow:var(--shadow);">

                    <!-- Tab -->
                    <div style="display:flex; border:1px solid var(--color-border); border-radius:var(--radius); overflow:hidden; margin-bottom:1.5rem;">
                        <button id="tab-login" style="flex:1; padding:0.6rem; border:none; font-weight:600; cursor:pointer;
                            background:${this.mode==='login'?'var(--color-primary)':'transparent'};
                            color:${this.mode==='login'?'white':'var(--color-text-muted)'};">Нэвтрэх</button>
                        <button id="tab-register" style="flex:1; padding:0.6rem; border:none; font-weight:600; cursor:pointer;
                            background:${this.mode==='register'?'var(--color-primary)':'transparent'};
                            color:${this.mode==='register'?'white':'var(--color-text-muted)'};">Бүртгүүлэх</button>
                    </div>

                    <!-- Google товч -->
                    <button id="google-btn" style="
                        width:100%; padding:0.75rem; margin-bottom:1rem;
                        border:1px solid var(--color-border); border-radius:var(--radius);
                        background:var(--color-surface); color:var(--color-text-main);
                        font-size:0.95rem; font-weight:600; cursor:pointer;
                        display:flex; align-items:center; justify-content:center; gap:0.6rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google-ээр ${this.mode==='login'?'нэвтрэх':'бүртгүүлэх'}
                    </button>

                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                        <hr style="flex:1; border:none; border-top:1px solid var(--color-border);">
                        <span style="color:var(--color-text-muted); font-size:0.8rem;">эсвэл</span>
                        <hr style="flex:1; border:none; border-top:1px solid var(--color-border);">
                    </div>

                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        ${this.mode==='register' ? `
                        <div>
                            <label style="display:block; margin-bottom:0.4rem; font-size:0.85rem; font-weight:600;">Хэрэглэгчийн нэр</label>
                            <input type="text" id="field-username" placeholder="myusername123"
                                style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-bg); color:var(--color-text-main); font-size:0.95rem;">
                            <div id="username-status" style="font-size:0.75rem; margin-top:0.3rem; min-height:1rem;"></div>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:0.4rem; font-size:0.85rem; font-weight:600;">Нэр</label>
                            <input type="text" id="field-displayname" placeholder="Батболд"
                                style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-bg); color:var(--color-text-main); font-size:0.95rem;">
                        </div>
                        ` : ''}
                        <div>
                            <label style="display:block; margin-bottom:0.4rem; font-size:0.85rem; font-weight:600;">И-мэйл</label>
                            <input type="email" id="field-email" placeholder="user@example.com"
                                style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-bg); color:var(--color-text-main); font-size:0.95rem;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:0.4rem; font-size:0.85rem; font-weight:600;">Нууц үг</label>
                            <input type="password" id="field-password" placeholder="••••••••"
                                style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-bg); color:var(--color-text-main); font-size:0.95rem;">
                        </div>
                        <div id="form-error" style="color:red; font-size:0.85rem; display:none; padding:0.5rem; background:#fff0f0; border-radius:4px;"></div>
                        <button id="submit-btn" class="btn" style="padding:0.8rem; font-size:1rem;">
                            ${this.mode==='login'?'Нэвтрэх':'Бүртгүүлэх'}
                        </button>
                        ${this.mode==='login' ? `<p style="text-align:center; font-size:0.8rem; color:var(--color-text-muted);">Админ: admin@jorkhon.mn / admin123</p>` : ''}
                    </div>
                </div>
            </div>

            <!-- Google username modal -->
            <div id="username-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center;">
                <div style="background:var(--color-surface); padding:2rem; border-radius:var(--radius); width:360px; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                    <h3 style="margin-bottom:0.5rem;">Хэрэглэгчийн нэр сонгоно уу</h3>
                    <p style="color:var(--color-text-muted); font-size:0.85rem; margin-bottom:1rem;">Google акаунтаар нэвтэрч байна. Профайлд харагдах нэрээ оруулна уу.</p>
                    <input type="text" id="modal-username" placeholder="myusername123"
                        style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-bg); color:var(--color-text-main); margin-bottom:0.4rem;">
                    <div id="modal-username-status" style="font-size:0.75rem; min-height:1.2rem; margin-bottom:1rem;"></div>
                    <button id="modal-confirm-btn" class="btn" style="width:100%; padding:0.8rem;">Баталгаажуулах</button>
                    <div id="modal-error" style="color:red; font-size:0.85rem; margin-top:0.5rem; display:none;"></div>
                </div>
            </div>
        `;

        this.querySelector('#tab-login').addEventListener('click', () => { this.mode='login'; this.renderPage(); });
        this.querySelector('#tab-register').addEventListener('click', () => { this.mode='register'; this.renderPage(); });
        this.querySelector('#google-btn').addEventListener('click', () => this.handleGoogleLogin());
        this.querySelector('#submit-btn').addEventListener('click', () => {
            this.mode==='login' ? this.handleEmailLogin() : this.handleRegister();
        });

        if (this.mode==='register') {
            let t;
            this.querySelector('#field-username').addEventListener('input', e => {
                clearTimeout(t);
                t = setTimeout(() => this.checkUsername(e.target.value, '#username-status'), 400);
            });
        }
    }

    // ── Supabase helpers ─────────────────────────────────────
    async getUsers()               { return await getUsers(); }
    async saveUser(user)           { return await createUser(user); }
    // ─────────────────────────────────────────────────────────

    checkUsername(username, statusSel) {
        const el = this.querySelector(statusSel);
        if (!el) return null; // async шалгалт доор хийнэ
        if (!username) { el.textContent=''; return false; }
        if (username.length < 3) { el.textContent='⚠️ Хамгийн багадаа 3 тэмдэгт'; el.style.color='orange'; return false; }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) { el.textContent='⚠️ Зөвхөн үсэг, тоо, _ зөвшөөрнө'; el.style.color='orange'; return false; }
        // Async давхцал шалгалт
        el.textContent='⏳ Шалгаж байна...'; el.style.color='gray';
        getUsers().then(users => {
            const taken = users.some(u => u.username?.toLowerCase() === username.toLowerCase());
            if (taken) { el.textContent='✗ Энэ нэр аль хэдийн ашиглагдаж байна'; el.style.color='red'; }
            else { el.textContent='✓ Боломжтой'; el.style.color='green'; }
        });
        return true; // format зөв, async дүн хүлээнэ
    }

    async handleRegister() {
        const username = this.querySelector('#field-username')?.value.trim();
        const displayName = this.querySelector('#field-displayname')?.value.trim();
        const email = this.querySelector('#field-email')?.value.trim();
        const password = this.querySelector('#field-password')?.value;
        const errEl = this.querySelector('#form-error');
        const showErr = m => { errEl.textContent=m; errEl.style.display='block'; };
        errEl.style.display='none';

        if (!username||!displayName||!email||!password) return showErr('Бүх талбарыг бөглөнө үү.');
        if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) return showErr('Хэрэглэгчийн нэр буруу байна.');
        if (password.length < 6) return showErr('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.');

        const users = await getUsers();
        if (users.some(u => u.username?.toLowerCase() === username.toLowerCase())) return showErr('Энэ хэрэглэгчийн нэр аль хэдийн бүртгэлтэй.');
        if (users.some(u => u.email?.toLowerCase() === email.toLowerCase())) return showErr('Энэ и-мэйл аль хэдийн бүртгэлтэй.');

        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
            username,
            displayName,
            email,
            passwordHash: btoa(unescape(encodeURIComponent(password))),
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
            createdAt: new Date().toISOString(),
            provider: 'email',
            isAdmin: false
        };

        await createUser(newUser);
        this.loginSession(newUser);
    }

    async handleEmailLogin() {
        const email = this.querySelector('#field-email')?.value.trim();
        const password = this.querySelector('#field-password')?.value;
        const errEl = this.querySelector('#form-error');
        const showErr = m => { errEl.textContent=m; errEl.style.display='block'; };
        errEl.style.display='none';

        if (!email||!password) return showErr('И-мэйл болон нууц үгээ оруулна уу.');

        const passwordHash = btoa(unescape(encodeURIComponent(password)));
        try {
            // Supabase-аас и-мэйлээр хайх
            const user = await getUserByEmail(email);
            if (!user || user.password_hash !== passwordHash)
                return showErr('И-мэйл эсвэл нууц үг буруу байна.');
            this.loginSession(user);
        } catch {
            return showErr('Холболтын алдаа гарлаа. Дахин оролдоно уу.');
        }
    }

    // ── Google OAuth ──────────────────────────────────────────
    handleGoogleLogin() {
        if (this.GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
            this._loginGoogleDemo(); return;
        }
        if (!window.google?.accounts?.id) {
            alert('Google Identity Services ачаалагдаагүй байна.'); return;
        }
        window.google.accounts.id.initialize({
            client_id: this.GOOGLE_CLIENT_ID,
            callback: r => this._onGoogleCredential(r)
        });
        window.google.accounts.id.prompt(n => {
            if (n.isNotDisplayed() || n.isSkippedMoment()) this._loginGoogleDemo();
        });
    }

    _onGoogleCredential(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            this._processGoogleUser({ googleId:payload.sub, email:payload.email,
                displayName:payload.name, avatar:payload.picture, provider:'google' });
        } catch { this._loginGoogleDemo(); }
    }

    _loginGoogleDemo() {
        const ts = Date.now();
        this._processGoogleUser({
            googleId:`demo_${ts}`, email:`demo_${ts}@gmail.com`,
            displayName:'Google Хэрэглэгч',
            avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
            provider:'google'
        });
    }

    async _processGoogleUser(googleUser) {
        const users = await getUsers();
        const existing = users.find(u => u.email===googleUser.email && u.provider==='google');
        if (existing) {
            this.loginSession(existing);
        } else {
            this._pendingGoogleUser = googleUser;
            this._showUsernameModal(googleUser.displayName);
        }
    }

    _showUsernameModal(displayName) {
        const modal = this.querySelector('#username-modal');
        modal.style.display = 'flex';

        const suggested = displayName.toLowerCase()
            .replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').slice(0,20);
        this.querySelector('#modal-username').value = suggested;
        this.checkUsername(suggested, '#modal-username-status');

        let t;
        this.querySelector('#modal-username').addEventListener('input', e => {
            clearTimeout(t);
            t = setTimeout(() => this.checkUsername(e.target.value, '#modal-username-status'), 400);
        });

        this.querySelector('#modal-confirm-btn').addEventListener('click', async () => {
            const username = this.querySelector('#modal-username').value.trim();
            const errEl = this.querySelector('#modal-error');

            if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
                errEl.textContent='Хэрэглэгчийн нэрийг шалгана уу.'; errEl.style.display='block'; return;
            }
            const users = await getUsers();
            if (users.some(u => u.username?.toLowerCase()===username.toLowerCase())) {
                errEl.textContent='Энэ нэр аль хэдийн ашиглагдаж байна.'; errEl.style.display='block'; return;
            }

            errEl.style.display='none';
            modal.style.display='none';

            const g = this._pendingGoogleUser;
            const newUser = {
                id: `google_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
                username,
                displayName: g.displayName,
                email: g.email,
                avatar: g.avatar,
                createdAt: new Date().toISOString(),
                provider: 'google',
                isAdmin: false
            };
            await createUser(newUser);
            this.loginSession(newUser);
        });
    }
    // ─────────────────────────────────────────────────────────

    loginSession(user) {
        const session = {
            id: user.id, username: user.username,
            displayName: user.displayName, email: user.email,
            avatar: user.avatar, provider: user.provider,
            isAdmin: user.isAdmin || false
        };
        localStorage.setItem('fp_user', JSON.stringify(session));
        localStorage.setItem('fp_token', `token_${user.id}_${Date.now()}`);
        document.dispatchEvent(new CustomEvent('user-login', { bubbles: true }));
        window.location.hash = '/chat';
    }
}

customElements.define('page-login', PageLogin);