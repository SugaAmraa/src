import './recipe-chat.js';

export class PageChat extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div style="padding:0 1rem 1rem; width:100%; box-sizing:border-box;">
                <div style="margin-bottom:1rem;">
                    <h2 style="margin:0;">👨‍🍳 ChefBot</h2>
                    <p style="color:var(--color-text-muted); margin:0.25rem 0 0;">
                        Орцоо хэлээрэй — монголоор рецепт гаргаж өгнө!
                    </p>
                </div>
                <recipe-chat></recipe-chat>
            </div>
        `;
    }
}
customElements.define('page-chat', PageChat);
