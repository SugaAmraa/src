import './grocery-product.js';
import { getProducts, addProduct } from './supabase.js';

export class PageGrocery extends HTMLElement {
    constructor() {
        super();
        this.allProducts = [];
        this.activeCategory = 'all';
    }

    get isAdmin() {
        try {
            const user = JSON.parse(localStorage.getItem('fp_user') || 'null');
            return user?.isAdmin === true;
        } catch { return false; }
    }

    async connectedCallback() {
        this.innerHTML = `
            <div class="container">
                <h2 style="margin-bottom:1.5rem;">🛒 Дэлгүүр</h2>

                <!-- Зөвхөн admin-д харагдана -->
                <div id="add-product-form" style="display:none; margin-bottom:2rem; padding:1.2rem;
                    border:1px solid var(--color-border); border-radius:var(--radius);
                    background:var(--color-surface);">
                    <h3 style="margin-bottom:1rem; color:var(--color-primary);">
                        🔒 Бүтээгдэхүүн нэмэх <span style="font-size:0.75rem; background:#ffe0e0; color:#c00; padding:2px 8px; border-radius:4px;">АДМИН</span>
                    </h3>
                    <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size:0.8rem; color:var(--color-text-muted)">Нэр</label>
                            <input type="text" id="new-name" placeholder="Spinach"
                                style="padding:8px; border:1px solid var(--color-border); border-radius:4px; background:var(--color-bg); color:var(--color-text-main);">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size:0.8rem; color:var(--color-text-muted)">Үнэ (₮)</label>
                            <input type="number" id="new-price" placeholder="2500"
                                style="padding:8px; width:100px; border:1px solid var(--color-border); border-radius:4px; background:var(--color-bg); color:var(--color-text-main);">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size:0.8rem; color:var(--color-text-muted)">Ангилал</label>
                            <select id="new-category"
                                style="padding:8px; border:1px solid var(--color-border); border-radius:4px; background:var(--color-bg); color:var(--color-text-main);">
                                <option value="vegetable">🥦 Хүнсний ногоо</option>
                                <option value="meat">🥩 Мах</option>
                                <option value="dairy">🥛 Цагаан идээ</option>
                                <option value="grain">🌾 Үр тариа</option>
                                <option value="sauce">🫙 Соус</option>
                                <option value="seasoning">🧂 Амтлагч</option>
                                <option value="oil">🫒 Тос</option>
                                <option value="other">📦 Бусад</option>
                            </select>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size:0.8rem; color:var(--color-text-muted)">Зургийн URL</label>
                            <input type="text" id="new-image" placeholder="https://..."
                                style="padding:8px; width:220px; border:1px solid var(--color-border); border-radius:4px; background:var(--color-bg); color:var(--color-text-main);">
                        </div>
                        <button id="submit-btn"
                            style="padding:9px 20px; background:var(--color-primary); color:white; border:none; border-radius:4px; cursor:pointer; font-weight:600; align-self:flex-end;">
                            + Нэмэх
                        </button>
                    </div>
                </div>

                <!-- Category filter -->
                <div id="category-filters" style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem;"></div>

                <!-- Grid -->
                <div id="grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1.5rem;">
                    <p style="color:var(--color-text-muted)">Ачаалж байна...</p>
                </div>
            </div>
        `;

        // Admin form харуулах
        if (this.isAdmin) {
            this.querySelector('#add-product-form').style.display = 'block';
            this.querySelector('#submit-btn').addEventListener('click', () => this.addProduct());
        }

        await this.loadProducts();
    }

    getCategoryLabel(cat) {
        const map = {
            meat:'🥩 Мах', vegetable:'🥦 Ногоо', dairy:'🥛 Цагаан идээ',
            grain:'🌾 Үр тариа', sauce:'🫙 Соус', oil:'🫒 Тос',
            seasoning:'🧂 Амтлагч', other:'📦 Бусад'
        };
        return map[cat] || `📦 ${cat}`;
    }

    renderCategoryFilters() {
        const categories = ['all', ...new Set(this.allProducts.map(p=>p.category))];
        const container = this.querySelector('#category-filters');
        container.innerHTML = '';
        categories.forEach(cat => {
            const isActive = this.activeCategory === cat;
            const btn = document.createElement('button');
            btn.textContent = cat === 'all' ? '🌿 Бүгд' : this.getCategoryLabel(cat);
            btn.style.cssText = `
                padding:0.4rem 1rem; border-radius:20px; cursor:pointer;
                font-size:0.85rem; font-weight:600; transition:all 0.2s;
                border:2px solid ${isActive?'var(--color-primary)':'var(--color-border)'};
                background:${isActive?'var(--color-primary)':'var(--color-surface)'};
                color:${isActive?'white':'var(--color-text-main)'};
            `;
            btn.addEventListener('click', () => {
                this.activeCategory = cat;
                this.renderCategoryFilters();
                this.renderGrid();
            });
            container.appendChild(btn);
        });
    }

    renderGrid() {
        const grid = this.querySelector('#grid');
        grid.innerHTML = '';
        const filtered = this.activeCategory === 'all'
            ? this.allProducts
            : this.allProducts.filter(p=>p.category===this.activeCategory);

        if (!filtered.length) {
            grid.innerHTML = `<p style="color:var(--color-text-muted)">Энэ ангилалд бүтээгдэхүүн байхгүй байна.</p>`;
            return;
        }
        filtered.forEach(p => {
            const el = document.createElement('grocery-product');
            el.setAttribute('product-id', p.id);
            el.setAttribute('name', p.name);
            el.setAttribute('price', p.price);
            el.setAttribute('image', p.image);
            grid.appendChild(el);
        });
    }

    async loadProducts() {
        try {
            let products;
            try {
                const res = await fetch('http://localhost:3000/products');
                if (!res.ok) throw new Error('no server');
                products = await res.json();
            } catch {
                // Server байхгүй — products.json-ийг шууд уншина
                const res = await fetch('/src/data/products.json');
                if (!res.ok) throw new Error('no json');
                products = await res.json();
            }
            this.allProducts = products;
            this.renderCategoryFilters();
            this.renderGrid();
        } catch {
            this.querySelector('#grid').innerHTML = `
                <p style="color:red; grid-column:1/-1;">
                    ⚠️ Бүтээгдэхүүн ачаалж чадсангүй.<br>
                    <small>products.json файлаа <code>src/data/products.json</code> замд байрлуулна уу.</small>
                </p>`;
        }
    }

    async addProduct() {
        const name = this.querySelector('#new-name').value.trim();
        const price = parseFloat(this.querySelector('#new-price').value);
        const image = this.querySelector('#new-image').value.trim();
        const category = this.querySelector('#new-category').value;

        if (!name || !price) { alert('Нэр болон үнийг оруулна уу.'); return; }

        const newProduct = {
            id: `p_${Date.now()}`,
            name, price, category,
            synonyms: JSON.stringify([name.toLowerCase()]),
            image: image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
        };

        try {
            const saved = await addProduct(newProduct);
            this.allProducts.push(saved);
        } catch(e) {
            alert('Бүтээгдэхүүн нэмж чадсангүй: ' + (e.message || 'Supabase алдаа'));
            return;
        }

        this.querySelector('#new-name').value = '';
        this.querySelector('#new-price').value = '';
        this.querySelector('#new-image').value = '';
        this.renderCategoryFilters();
        this.renderGrid();
    }
}

customElements.define('page-grocery', PageGrocery);