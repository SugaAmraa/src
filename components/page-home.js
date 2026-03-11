export class PageHome extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="container" style="text-align:center; padding: 4rem 1rem;">
                <h1 style="font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem;">Eat Fresh. Live Better.</h1>
                <p style="font-size: 1.2rem; color: var(--color-text-muted); max-width: 600px; margin: 0 auto 2rem;">
                    Your personal AI chef and grocery assistant. Get custom recipes based on what you have, and order fresh ingredients in seconds.
                </p>
                <div style="display:flex; gap:1rem; justify-content:center;">
                    <a href="#/chat" class="btn" style="
                        display:inline-flex; align-items:center; gap:0.5rem;
                        padding:0.75rem 1.75rem; border-radius:25px;
                        background:var(--color-primary); color:white;
                        font-weight:700; text-decoration:none; font-size:1rem;
                        box-shadow:0 4px 12px rgba(0,0,0,0.15);
                        transition:all 0.2s;">🍳 Хоол хийж эхлэх</a>
                    <a href="#/grocery" class="btn btn-outline" style="
                        display:inline-flex; align-items:center; gap:0.5rem;
                        padding:0.75rem 1.75rem; border-radius:25px;
                        border:2px solid var(--color-primary); color:var(--color-primary);
                        font-weight:700; text-decoration:none; font-size:1rem;
                        transition:all 0.2s; background:transparent;">🛒 Дэлгүүр</a>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 4rem; text-align: left;">
                    <div style="padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-surface);">
                        <h3 style="color:var(--color-accent)">AI Recipes</h3>
                        <p>Tell us what ingredients you have, and we'll generate a delicious meal plan instantly.</p>
                    </div>
                    <div style="padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-surface);">
                        <h3 style="color:var(--color-primary)">Fresh Groceries</h3>
                        <p>One-click add ingredients from recipes directly to your shopping cart.</p>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('page-home', PageHome);
