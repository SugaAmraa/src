import './app-router.js';
import './sidebar-cart.js';
import './theme-toggle.js';

export class AppRoot extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    setupEventListeners() {
        this.addEventListener('route-changed', (e) => {
            this.updateActiveLink(e.detail.route);
        });

        document.addEventListener('user-login', () => this.checkLoginStatus());
        this.addEventListener('user-logout', () => {
            localStorage.removeItem('fp_user');
            localStorage.removeItem('fp_token');
            this.checkLoginStatus();
            window.location.hash = '/';
        });

        this.shadowRoot.getElementById('cart-btn').addEventListener('click', () => {
            const cart = this.shadowRoot.querySelector('sidebar-cart');
            cart.toggleVisibility();
        });

        this.shadowRoot.getElementById('nav-logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('user-logout', { bubbles: true, composed: true }));
        });
    }

    checkLoginStatus() {
        const userStr = localStorage.getItem('fp_user');
        const loginLink = this.shadowRoot.getElementById('nav-login');
        const logoutBtn = this.shadowRoot.getElementById('nav-logout');
        const userDisplay = this.shadowRoot.getElementById('user-display');

        if (userStr) {
            const user = JSON.parse(userStr);
            loginLink.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            if (userDisplay) {
                userDisplay.classList.remove('hidden');
                userDisplay.textContent = `👤 ${user.displayName || user.username || 'User'}`;
            }
        } else {
            loginLink.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            if (userDisplay) userDisplay.classList.add('hidden');
        }
    }

    updateActiveLink(route) {
        const links = this.shadowRoot.querySelectorAll('nav a');
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${route}`);
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            @import url('src/styles/variables.css');
            :host {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }
            header {
                background: var(--color-surface);
                padding: var(--space-sm) var(--space-md);
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: var(--shadow);
                position: sticky;
                top: 0;
                z-index: 100;
            }
            .logo {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--color-primary);
                text-decoration: none;
            }
            nav a {
                margin-left: var(--space-sm);
                color: var(--color-text-main);
                font-weight: 500;
                text-decoration: none;
                font-size: 0.95rem;
                padding: 0.2rem 0;
                border-bottom: 2px solid transparent;
                transition: color 0.2s, border-color 0.2s;
            }
            nav a.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
            nav a:hover { color: var(--color-primary); }
            .hidden { display: none !important; }
            main {
                flex: 1;
                padding: var(--space-md) 0;
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
            }
            footer {
                text-align: center;
                padding: var(--space-md);
                color: var(--color-text-muted);
                font-size: var(--fs-sm);
                border-top: 1px solid var(--color-border);
            }
            .actions {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
            }
            #cart-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                position: relative;
            }
            #user-display {
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--color-primary);
                padding: 0.3rem 0.7rem;
                border: 1px solid var(--color-primary);
                border-radius: 20px;
            }
            #nav-logout {
                color: var(--color-text-muted);
                font-size: 0.85rem;
            }
            #nav-logout:hover { color: red; }

            @media (max-width: 600px) {
                .logo span { display: none; }
                nav a { font-size: 0.8rem; margin-left: 0.5rem; }
                #user-display { display: none; }
            }
        </style>

        <header>
            <a href="#/" class="logo">🌿 <span>Jorkhon</span></a>
            <nav>
                <a href="#/">Нүүр</a>
                <a href="#/chat">ChefBot</a>
                <a href="#/grocery">Дэлгүүр</a>
                <a href="#/about">Тухай</a>
                <a href="#/login" id="nav-login">Нэвтрэх</a>
                <a href="#" id="nav-logout" class="hidden">Гарах</a>
            </nav>
            <div class="actions">
                <span id="user-display" class="hidden"></span>
                <theme-toggle></theme-toggle>
                <button id="cart-btn" aria-label="Cart">🛒</button>
            </div>
        </header>

        <main>
            <app-router></app-router>
        </main>

        <sidebar-cart></sidebar-cart>

        <footer>
            <p>&copy; 2025 Jorkhon. Эрүүл хооллоорой. 🌿</p>
        </footer>
        `;
    }
}

customElements.define('app-root', AppRoot);
