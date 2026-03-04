import './recipe-chat.js';

export class PageChat extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="container">
                <div style="margin-bottom:1.5rem;">
                    <h2>🤖 ChefBot Туслах</h2>
                    <p style="color:var(--color-text-muted);">Орцоо эсвэл хоолны хүслээ хэлээрэй, би танд жор гаргаж өгнө.</p>
                </div>
                <recipe-chat></recipe-chat>
            </div>
        `;
    }
}
customElements.define('page-chat', PageChat);