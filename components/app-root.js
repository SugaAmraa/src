import './app-router.js';
import './sidebar-cart.js';
import './theme-toggle.js';

/**
 * Main App Shell
 * Contains Header, Router, Footer, and Global Event Listeners.
 */
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
        // Listen for route changes to update UI
        this.addEventListener('route-changed', (e) => {
            this.updateActiveLink(e.detail.route);
        });

        // Listen for login/logout events from pages
        this.addEventListener('user-login', () => this.checkLoginStatus());
        this.addEventListener('user-logout', () => {
            localStorage.removeItem('fp_user');
            localStorage.removeItem('fp_token');
            this.checkLoginStatus();
            window.location.hash = '/';
        });

        // Toggle Sidebar Cart on Mobile
        this.shadowRoot.getElementById('cart-btn').addEventListener('click', () => {
            const cart = this.shadowRoot.querySelector('sidebar-cart');
            cart.toggleVisibility();
        });
    }

    checkLoginStatus() {
        const user = localStorage.getItem('fp_user');
        const loginLink = this.shadowRoot.getElementById('nav-login');
        const logoutBtn = this.shadowRoot.getElementById('nav-logout');
        
        if (user) {
            loginLink.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            loginLink.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
    }

    updateActiveLink(route) {
        const links = this.shadowRoot.querySelectorAll('nav a');
        links.forEach(link => {
            if(link.getAttribute('href') === `#${route}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
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
                display: flex; justify-content: space-between; 
                align-items: center;
                box-shadow: var(--shadow);
                position: sticky; 
                top: 0;
                z-index: 100;
            }
            .logo { font-size: 1.5rem;
            font-weight: bold;
            color: var(--color-primary); 
            text-decoration: none; 
            }
            nav a { 
                margin-left: var(--space-sm);
                color: var(--color-text-main);
                font-weight: 500;
                text-decoration: none;
                padding: 0.45rem 1rem;
                border-radius: 20px;
                border: 1.5px solid transparent;
                transition: all 0.2s;
            }
            nav a.active {
                color: var(--color-primary);
                border-color: var(--color-primary);
                background: color-mix(in srgb, var(--color-primary) 10%, transparent);
            }
            nav a:hover {
                color: var(--color-primary);
                border-color: var(--color-primary);
                background: color-mix(in srgb, var(--color-primary) 8%, transparent);
            }
            nav a#nav-login {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }
            nav a#nav-login:hover {
                opacity: 0.85;
                color: white;
            }
            nav a#nav-logout {
                color: #ef4444;
                border-color: #ef4444;
            }
            nav a#nav-logout:hover {
                background: #fff0f0;
            }
            .hidden {
             display: none !important; 
             }
            main { flex: 1; 
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
            }
            .actions { display: flex; 
            align-items: center; 
            gap: var(--space-sm); 
            }
            
            @media (max-width: 600px) {
                .logo span { display: none; }
                nav a { font-size: 0.9rem; }
            }
        </style>

        <header>
            <a href="#/" class="logo">🌿 <span>Jorkhon</span></a>
            <nav>
                <a href="#/">Нүүр</a>
                <a href="#/chat">🍳 Хоол хийж эхлэх</a>
                <a href="#/grocery">🛒 Дэлгүүр</a>
                <a href="#/about">Бидний тухай</a>
                <a href="#/login" id="nav-login">Нэвтрэх</a>
                <a href="#" id="nav-logout" class="hidden">Гарах</a>
            </nav>
            <div class="actions">
                <theme-toggle></theme-toggle>
                <button id="cart-btn" style="background:none; border:none; font-size:1.5rem;">🛒</button>
            </div>
        </header>

        <main>
            <app-router></app-router>
        </main>

        <sidebar-cart></sidebar-cart>

        <footer>
            <p>&copy; 2025 Jorkhon. Eat Healthy.</p>
        </footer>
        `;
    }
}

customElements.define('app-root', AppRoot);