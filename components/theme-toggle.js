export class ThemeToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.theme = localStorage.getItem('fp_theme') || 'light';
    }

    connectedCallback() {
        // Render HTML once — innerHTML дахин бичихгүй, тиймээс listener устахгүй
        this.shadowRoot.innerHTML = `
        <style>
            :host { display: inline-block; }
            button {
                background: none;
                border: 1px solid var(--color-border, #ccc);
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                transition: border-color 0.3s, background 0.3s;
            }
            button:hover { background: var(--color-primary-light, #e0f5ee); }
        </style>
        <button aria-label="Toggle Theme"></button>
        `;

        this._btn = this.shadowRoot.querySelector('button');
        // Event listener нэг удаа холбоно
        this._btn.addEventListener('click', () => this.toggle());

        this.applyTheme();
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('fp_theme', this.theme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.body.setAttribute('data-theme', this.theme);
        if (this._btn) {
            this._btn.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }
}

customElements.define('theme-toggle', ThemeToggle);
