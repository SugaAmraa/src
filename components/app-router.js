export class AppRouter extends HTMLElement {
    constructor() {
        super();
        this.routes = {
            '/': 'page-home',
            '/login': 'page-login',
            '/chat': 'page-chat',
            '/grocery': 'page-grocery',
            '/about': 'page-about',
            '/faq': 'page-faq'
        };
        this.protectedRoutes = ['/chat', '/grocery'];
    }

    connectedCallback() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        // Handle initial load
        this.handleRoute();
    }

    async handleRoute() {
        let hash = window.location.hash.slice(1) || '/';
        // Normalize hash (remove query params if any for simplicity)
        hash = hash.split('?')[0];

        // Check Auth Guard
        if (this.protectedRoutes.includes(hash)) {
            const user = localStorage.getItem('fp_user');
            if (!user) {
                window.location.hash = '/login';
                return;
            }
        }

        const componentName = this.routes[hash] || 'page-home';
        
        // Dynamic Import for Lazy Loading
        try {
            await import(`./${componentName}.js`);
        } catch (e) {
            console.error(`Failed to load ${componentName}`, e);
        }

        this.innerHTML = `<${componentName}></${componentName}>`;
        window.scrollTo(0, 0);

        // Dispatch event for UI updates (e.g., active nav state)
        this.dispatchEvent(new CustomEvent('route-changed', {
            detail: { route: hash },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('app-router', AppRouter);