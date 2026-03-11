import { getProducts } from './supabase.js';

export class RecipeChat extends HTMLElement {
    constructor() {
        super();
        this.messages = [];
        this.products = [];
    }

    async connectedCallback() {
        this.render();
        this.products = await getProducts().catch(() => []);
        // Угтах мэдээллийг зөвхөн харуулах — this.messages-д оруулахгүй
        this._render([{
            role: 'assistant',
            content: `Сайн байна уу! 👋 Би таны хоолны туслах ChefBot.\n\nНадаас юу асуух вэ?\n- 🍳 жор хүсэх\n- 🥩 Орцоор хоол санал болгуулах\n- 🛒 Дэлгүүрийн зөвлөгөө авах`
        }]);
    }

    render() {
        this.innerHTML = `
            <div style="display:flex; flex-direction:column; height:70vh; max-width:800px;
                border:1px solid var(--color-border); border-radius:var(--radius);
                background:var(--color-surface); overflow:hidden;">

                <div style="padding:1rem 1.5rem; border-bottom:1px solid var(--color-border);
                    background:var(--color-primary); color:white;
                    display:flex; align-items:center; gap:0.75rem;">
                    <span style="font-size:1.5rem;">👨‍🍳</span>
                    <div>
                        <div style="font-weight:700;">ChefBot</div>
                        <div style="font-size:0.75rem; opacity:0.85;">Groq AI-д суурилсан хоолны туслах</div>
                    </div>
                </div>

                <div id="messages" style="flex:1; overflow-y:auto; padding:1.5rem;
                    display:flex; flex-direction:column; gap:1rem;"></div>

                <div style="padding:1rem; border-top:1px solid var(--color-border);
                    display:flex; gap:0.75rem; background:var(--color-bg);">
                    <input id="chat-input" type="text"
                        placeholder="Рецепт асуух, орц бичих..."
                        style="flex:1; padding:0.75rem 1rem; border:1px solid var(--color-border);
                        border-radius:var(--radius); background:var(--color-surface);
                        color:var(--color-text-main); font-size:0.95rem;">
                    <button id="send-btn" style="padding:0.75rem 1.25rem;
                        background:var(--color-primary); color:white; border:none;
                        border-radius:var(--radius); cursor:pointer; font-size:1.1rem;">➤</button>
                </div>
            </div>
        `;

        const input = this.querySelector('#chat-input');
        this.querySelector('#send-btn').addEventListener('click', () => this.sendMessage());
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
        });
    }

    addMessage(role, text) {
        if (role !== 'typing') this.messages.push({ role, content: text });
        this._render(role === 'typing' ? [...this.messages, { role:'typing', content:'...' }] : this.messages);
    }

    _render(msgs) {
        const container = this.querySelector('#messages');
        if (!container) return;
        container.innerHTML = '';

        msgs.forEach(msg => {
            const isUser   = msg.role === 'user';
            const isTyping = msg.role === 'typing';
            const div = document.createElement('div');
            div.style.cssText = `display:flex; justify-content:${isUser ? 'flex-end' : 'flex-start'};`;

            const content = isTyping
                ? `<span style="opacity:0.5">● ● ●</span>`
                : this._format(msg.content, !isUser);

            div.innerHTML = `
                <div style="max-width:75%; padding:0.85rem 1.1rem;
                    border-radius:${isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
                    background:${isUser ? 'var(--color-primary)' : 'var(--color-bg)'};
                    color:${isUser ? 'white' : 'var(--color-text-main)'};
                    border:${isUser ? 'none' : '1px solid var(--color-border)'};
                    font-size:0.92rem; line-height:1.6; white-space:pre-wrap;">
                    ${content}
                </div>`;
            container.appendChild(div);
        });

        // [САГС] товч дээр event
        container.querySelectorAll('.cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name    = btn.dataset.name;
                const product = this.products.find(p =>
                    p.name.toLowerCase().includes(name.toLowerCase()) ||
                    name.toLowerCase().includes(p.name.toLowerCase())
                );
                if (product) {
                    this.dispatchEvent(new CustomEvent('add-to-cart', {
                        bubbles:true, composed:true,
                        detail:{ id:product.id, name:product.name, price:product.price, qty:1 }
                    }));
                    btn.textContent = '✓ Нэмэгдлээ';
                    btn.style.background = '#22c55e';
                    btn.disabled = true;
                } else {
                    btn.textContent = '✗ Олдсонгүй';
                    btn.style.background = '#ef4444';
                }
            });
        });

        container.scrollTop = container.scrollHeight;
    }

    _format(text, isAssistant) {
        if (!isAssistant) return text;
        return text.replace(/\[САГС:([^\]]+)\]/g, (_, name) =>
            `<button class="cart-btn" data-name="${name.trim()}"
                style="display:inline-flex; align-items:center; gap:4px;
                margin:2px 4px; padding:3px 10px;
                background:var(--color-primary); color:white; border:none;
                border-radius:12px; font-size:0.78rem; cursor:pointer;">
                🛒 ${name.trim()}
            </button>`
        );
    }

    async sendMessage() {
        const input = this.querySelector('#chat-input');
        const text  = input.value.trim();
        if (!text) return;

        input.value   = '';
        input.disabled = true;
        this.querySelector('#send-btn').disabled = true;

        this.addMessage('user', text);
        this._render([...this.messages, { role:'typing', content:'...' }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.messages,
                    products: this.products
                })
            });

            const data = await res.json();
            if (res.status === 429) {
                this.addMessage('assistant', '⏳ Хэт олон хүсэлт илгээлээ. 30 секунд хүлээгээд дахин оролдоно уу.');
                return;
            }
            if (!res.ok) throw new Error(data.error || 'API алдаа');
            this.addMessage('assistant', data.content);

        } catch {
            this.addMessage('assistant', '⚠️ Алдаа гарлаа. Дахин оролдоно уу.');
        } finally {
            input.disabled = false;
            this.querySelector('#send-btn').disabled = false;
            input.focus();
        }
    }
}

customElements.define('recipe-chat', RecipeChat);
