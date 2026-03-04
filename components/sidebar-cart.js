export class SidebarCart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cart = JSON.parse(localStorage.getItem('fp_cart')) || [];
        this.taxRate = 0.08;
    }

    connectedCallback() {
        this.render();
        this.updateUI();

        document.addEventListener('add-to-cart', (e) => {
            this.addItem(e.detail);
            this.showBadge();
        });
        document.addEventListener('add-ingredients', (e) => {
            this.addIngredients(e.detail);
        });
    }

    toggleVisibility() {
        const aside = this.shadowRoot.querySelector('aside');
        aside.classList.toggle('open');
    }

    showBadge() {
        const badge = this.shadowRoot.getElementById('badge');
        if (badge) {
            badge.textContent = this.cart.reduce((sum, i) => sum + i.qty, 0);
            badge.style.display = 'flex';
        }
    }

    addItem(product) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty += (product.qty || 1);
        } else {
            this.cart.push({ ...product, qty: product.qty || 1 });
        }
        this.save();
    }

    addIngredients(ingredients) {
        ingredients.forEach(ing => {
            this.cart.push({
                id: `gen-${Date.now()}-${Math.random()}`,
                name: ing.name,
                price: ing.estimatedPrice || 2000,
                qty: 1
            });
        });
        this.save();
        // Open cart to show added items
        const aside = this.shadowRoot.querySelector('aside');
        if (!aside.classList.contains('open')) aside.classList.add('open');
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.save();
    }

    updateQty(id, delta) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) this.removeItem(id);
            else this.save();
        }
    }

    clearCart() {
        if (confirm('Сагсыг цэвэрлэх үү?')) {
            this.cart = [];
            this.save();
        }
    }

    save() {
        localStorage.setItem('fp_cart', JSON.stringify(this.cart));
        this.updateUI();
        this.showBadge();
    }

    updateUI() {
        const list = this.shadowRoot.getElementById('cart-list');
        const subtotalEl = this.shadowRoot.getElementById('subtotal');
        const taxEl = this.shadowRoot.getElementById('tax');
        const totalEl = this.shadowRoot.getElementById('total');
        const emptyMsg = this.shadowRoot.getElementById('empty-msg');
        const badge = this.shadowRoot.getElementById('badge');

        if (!list) return;

        list.innerHTML = '';
        let subtotal = 0;
        const totalQty = this.cart.reduce((sum, i) => sum + i.qty, 0);

        if (this.cart.length === 0) {
            emptyMsg.style.display = 'flex';
            if (badge) badge.style.display = 'none';
        } else {
            emptyMsg.style.display = 'none';
            if (badge) {
                badge.textContent = totalQty;
                badge.style.display = 'flex';
            }
        }

        this.cart.forEach(item => {
            subtotal += item.price * item.qty;
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">₮${(item.price * item.qty).toLocaleString()}</span>
                    <span class="item-unit">₮${item.price.toLocaleString()} × ${item.qty}</span>
                </div>
                <div class="item-actions">
                    <button class="qty-btn dec" aria-label="Decrease">−</button>
                    <span class="qty-display">${item.qty}</span>
                    <button class="qty-btn inc" aria-label="Increase">+</button>
                    <button class="del-btn" aria-label="Remove">🗑</button>
                </div>
            `;

            li.querySelector('.dec').onclick = () => this.updateQty(item.id, -1);
            li.querySelector('.inc').onclick = () => this.updateQty(item.id, 1);
            li.querySelector('.del-btn').onclick = () => this.removeItem(item.id);
            list.appendChild(li);
        });

        const tax = subtotal * this.taxRate;
        const total = subtotal + tax;

        subtotalEl.textContent = `₮${subtotal.toLocaleString()}`;
        taxEl.textContent = `₮${Math.round(tax).toLocaleString()}`;
        totalEl.textContent = `₮${Math.round(total).toLocaleString()}`;
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                position: fixed;
                z-index: 1000;
            }
            aside {
                position: fixed;
                top: 0;
                right: -380px;
                width: 360px;
                height: 100%;
                background: var(--color-surface, #fff);
                box-shadow: -4px 0 20px rgba(0,0,0,0.15);
                transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                font-family: system-ui, sans-serif;
            }
            aside.open { right: 0; }

            /* Overlay */
            .overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.3);
                z-index: -1;
                backdrop-filter: blur(2px);
            }
            aside.open ~ .overlay,
            aside.open + .overlay { display: block; }

            .cart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.2rem 1.2rem 1rem;
                border-bottom: 1px solid var(--color-border, #e0e0e0);
                background: var(--color-surface, #fff);
            }
            .cart-header h2 {
                font-size: 1.1rem;
                font-weight: 700;
                color: var(--color-text-main, #111);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .header-btns { display: flex; gap: 0.5rem; align-items: center; }
            .close-btn {
                background: none;
                border: none;
                font-size: 1.4rem;
                cursor: pointer;
                color: var(--color-text-muted, #666);
                line-height: 1;
                padding: 0.2rem;
            }
            .clear-btn {
                font-size: 0.75rem;
                padding: 0.3rem 0.7rem;
                border: 1px solid var(--color-border, #ccc);
                border-radius: 4px;
                background: none;
                cursor: pointer;
                color: var(--color-text-muted, #666);
            }
            .clear-btn:hover { color: red; border-color: red; }

            /* Empty State */
            #empty-msg {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--color-text-muted, #888);
                gap: 0.5rem;
                font-size: 0.95rem;
            }
            #empty-msg span { font-size: 3rem; }

            /* Item List */
            #cart-list {
                list-style: none;
                padding: 0.5rem 0;
                flex: 1;
                overflow-y: auto;
                margin: 0;
            }
            .cart-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.8rem 1.2rem;
                border-bottom: 1px solid var(--color-border, #eee);
                gap: 0.5rem;
                transition: background 0.2s;
            }
            .cart-item:hover { background: var(--color-bg, #f9f9f9); }
            .item-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
                min-width: 0;
            }
            .item-name {
                font-weight: 600;
                font-size: 0.9rem;
                color: var(--color-text-main, #111);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .item-price {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--color-primary, green);
            }
            .item-unit {
                font-size: 0.75rem;
                color: var(--color-text-muted, #888);
            }
            .item-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
            }
            .qty-btn {
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 1px solid var(--color-border, #ccc);
                background: var(--color-bg, #f5f5f5);
                cursor: pointer;
                font-size: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                color: var(--color-text-main, #111);
            }
            .qty-btn:hover { background: var(--color-primary, green); color: white; border-color: var(--color-primary); }
            .qty-display {
                min-width: 22px;
                text-align: center;
                font-weight: 600;
                font-size: 0.9rem;
                color: var(--color-text-main, #111);
            }
            .del-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                opacity: 0.5;
                transition: opacity 0.2s;
                padding: 0 2px;
                margin-left: 4px;
            }
            .del-btn:hover { opacity: 1; }

            /* Summary */
            .summary {
                padding: 1rem 1.2rem;
                border-top: 2px solid var(--color-border, #eee);
                background: var(--color-surface, #fff);
            }
            .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.4rem;
                font-size: 0.9rem;
                color: var(--color-text-muted, #666);
            }
            .row.total {
                font-weight: 700;
                font-size: 1.1rem;
                color: var(--color-text-main, #111);
                margin-top: 0.5rem;
                padding-top: 0.5rem;
                border-top: 1px dashed var(--color-border, #ddd);
            }
            .checkout-btn {
                width: 100%;
                padding: 0.9rem;
                background: var(--color-primary, green);
                color: white;
                border: none;
                border-radius: var(--radius, 8px);
                margin-top: 1rem;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: filter 0.2s;
            }
            .checkout-btn:hover { filter: brightness(110%); }

            /* Badge (external) — shown by parent */
            #badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--color-accent, orange);
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 0.7rem;
                font-weight: bold;
                display: none;
                align-items: center;
                justify-content: center;
            }
        </style>

        <aside>
            <div class="cart-header">
                <h2>🛒 Таны сагс</h2>
                <div class="header-btns">
                    <button class="clear-btn" id="clear-btn">Цэвэрлэх</button>
                    <button class="close-btn" id="close-btn">✕</button>
                </div>
            </div>

            <div id="empty-msg">
                <span>🛍️</span>
                <p>Сагс хоосон байна</p>
            </div>

            <ul id="cart-list"></ul>

            <div class="summary">
                <div class="row"><span>Дүн:</span> <span id="subtotal">₮0</span></div>
                <div class="row"><span>НӨАТ (8%):</span> <span id="tax">₮0</span></div>
                <div class="row total"><span>Нийт:</span> <span id="total">₮0</span></div>
                <button class="checkout-btn" id="checkout-btn">💳 Захиалга өгөх</button>
            </div>
        </aside>
        `;

        this.shadowRoot.getElementById('close-btn').addEventListener('click', () => this.toggleVisibility());
        this.shadowRoot.getElementById('clear-btn').addEventListener('click', () => this.clearCart());
        this.shadowRoot.getElementById('checkout-btn').addEventListener('click', () => {
            if (this.cart.length === 0) {
                alert('Сагс хоосон байна!');
                return;
            }
            alert(`✅ Захиалга амжилттай! Нийт: ₮${Math.round(this.cart.reduce((s,i)=>s+i.price*i.qty,0)*1.08).toLocaleString()}`);
            this.cart = [];
            this.save();
            this.toggleVisibility();
        });
    }
}
customElements.define('sidebar-cart', SidebarCart);
