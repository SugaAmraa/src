export class GroceryProduct extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // 'id' attribute нь HTML-ийн суурь attribute-тай давхцдаг тул 'product-id' ашиглана
        this.productId = this.getAttribute('product-id');
        this.productName = this.getAttribute('name');
        this.productPrice = parseFloat(this.getAttribute('price'));
        this.productImage = this.getAttribute('image');
        this.render();

        this.shadowRoot.getElementById('add-btn').addEventListener('click', () => {
            const qty = parseInt(this.shadowRoot.getElementById('qty').value) || 1;
            this.dispatchEvent(new CustomEvent('add-to-cart', {
                bubbles: true, composed: true,
                detail: {
                    id: this.productId,
                    name: this.productName,
                    price: this.productPrice,
                    qty
                }
            }));
            // Visual feedback
            const btn = this.shadowRoot.getElementById('add-btn');
            btn.textContent = '✓ Нэмэгдлээ';
            btn.style.background = 'var(--color-accent)';
            setTimeout(() => {
                btn.textContent = 'Сагсанд нэмэх';
                btn.style.background = 'var(--color-primary)';
            }, 1200);
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                border: 1px solid var(--color-border);
                border-radius: var(--radius);
                overflow: hidden;
                background: var(--color-surface);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            :host(:hover) {
                transform: translateY(-3px);
                box-shadow: var(--shadow);
            }
            .img-wrap {
                width: 100%;
                height: 150px;
                overflow: hidden;
                background: var(--color-border);
                position: relative;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                /* crossorigin зураг зөв ачаалагдахын тулд */
            }
            .img-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 3rem;
                background: var(--color-bg);
            }
            .content { padding: 0.9rem; }
            h3 { font-size: 0.95rem; margin: 0 0 0.4rem; color: var(--color-text-main); }
            .price { color: var(--color-primary); font-weight: 700; font-size: 1.05rem; }
            .controls { display: flex; gap: 0.5rem; margin-top: 0.7rem; align-items: center; }
            input[type="number"] {
                width: 48px;
                text-align: center;
                border: 1px solid var(--color-border);
                border-radius: 4px;
                padding: 0.3rem;
                background: var(--color-bg);
                color: var(--color-text-main);
            }
            button {
                flex: 1;
                background: var(--color-primary);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 0.45rem 0.5rem;
                cursor: pointer;
                font-size: 0.82rem;
                font-weight: 600;
                transition: background 0.2s, filter 0.2s;
            }
            button:hover { filter: brightness(110%); }
        </style>
        <div class="img-wrap">
            <img
                src="${this.productImage}"
                alt="${this.productName}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                loading="lazy"
            >
            <div class="img-placeholder" style="display:none;">🛒</div>
        </div>
        <div class="content">
            <h3>${this.productName}</h3>
            <div class="price">₮${this.productPrice.toLocaleString()}</div>
            <div class="controls">
                <input type="number" id="qty" value="1" min="1" max="99">
                <button id="add-btn">Сагсанд нэмэх</button>
            </div>
        </div>
        `;
    }
}

customElements.define('grocery-product', GroceryProduct);