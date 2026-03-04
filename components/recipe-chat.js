export class RecipeChat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.history = JSON.parse(localStorage.getItem('fp_chat_history')) || [];
        this.products = [];
    }

    async connectedCallback() {
        this.render();
        this.messagesContainer = this.shadowRoot.getElementById('messages');
        this.input = this.shadowRoot.getElementById('chat-input');

        // Load products for recipe generation
        await this.loadProducts();

        this.restoreHistory();

        this.shadowRoot.getElementById('send-btn').addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });

        // Show welcome message if no history
        if (this.history.length === 0) {
            this.appendMessage('bot', `
                <div style="padding:0.5rem 0;">
                    <p>👋 Сайн байна уу! Би <strong>ChefBot</strong> — таны хувийн тогооч.</p>
                    <p style="margin-top:0.5rem;">Ямар орцтой байна вэ? Жишээлбэл:</p>
                    <div style="margin-top:0.5rem; display:flex; flex-wrap:wrap; gap:0.4rem;" id="suggestions">
                        <button class="suggest-btn" data-text="chicken and rice">🍗 Тахиа + цагаан будаа</button>
                        <button class="suggest-btn" data-text="eggs and garlic">🥚 Өндөг + часнай</button>
                        <button class="suggest-btn" data-text="beef and potato">🥩 Үхрийн мах + төмс</button>
                        <button class="suggest-btn" data-text="pasta">🍝 Паста</button>
                    </div>
                </div>
            `, false);

            // Add click listeners for suggestion buttons
            this.messagesContainer.querySelectorAll('.suggest-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.input.value = btn.dataset.text;
                    this.handleSend();
                });
            });
        }
    }

    async loadProducts() {
        try {
            let products;
            try {
                const res = await fetch('http://localhost:3000/products');
                if (!res.ok) throw new Error();
                products = await res.json();
            } catch {
                const res = await fetch('./src/data/products.json');
                products = await res.json();
            }
            this.products = products;
        } catch {
            // Fallback: use hardcoded minimal list
            this.products = [
                { id:'1', name:'Chicken Breast', synonyms:['chicken','meat'], price:9800, category:'meat' },
                { id:'7', name:'Eggs', synonyms:['egg','eggs'], price:6500, category:'dairy' },
                { id:'8', name:'Rice', synonyms:['rice'], price:4200, category:'grain' },
                { id:'9', name:'Garlic', synonyms:['garlic'], price:1500, category:'vegetable' },
                { id:'3', name:'Carrot', synonyms:['carrot'], price:1200, category:'vegetable' },
                { id:'11', name:'Beef', synonyms:['beef','meat'], price:18000, category:'meat' },
                { id:'12', name:'Pasta', synonyms:['pasta','noodles'], price:3200, category:'grain' },
            ];
        }
    }

    restoreHistory() {
        this.history.forEach(msg => this.appendMessage(msg.role, msg.content, false));
        this.scrollToBottom();
    }

    async handleSend() {
        const text = this.input.value.trim();
        if (!text) return;

        this.appendMessage('user', text);
        this.input.value = '';

        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = typingId;
        typingDiv.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();

        await new Promise(r => setTimeout(r, 700));
        typingDiv.remove();

        const recipe = this.generateRecipeFromProducts(text);
        const responseHTML = this.formatRecipe(recipe);
        this.appendMessage('bot', responseHTML);
    }

    // Match user input to actual products from JSON
    matchProducts(input) {
        const tokens = input.toLowerCase().split(/[\s,+]+/).filter(Boolean);
        const matched = [];
        const seen = new Set();

        for (const product of this.products) {
            for (const token of tokens) {
                const synonyms = product.synonyms || [];
                const nameMatch = product.name.toLowerCase().includes(token);
                const synonymMatch = synonyms.some(s => s.includes(token) || token.includes(s));
                if ((nameMatch || synonymMatch) && !seen.has(product.id)) {
                    matched.push(product);
                    seen.add(product.id);
                    break;
                }
            }
        }

        return matched;
    }

    // Find complementary ingredients from products.json
    findComplements(mainProducts) {
        const categories = new Set(mainProducts.map(p => p.category));
        const complements = [];

        // Always try to add seasoning/oil if not present
        const wantCategories = [];
        if (!categories.has('seasoning')) wantCategories.push('seasoning');
        if (!categories.has('oil')) wantCategories.push('oil');
        if (!categories.has('vegetable') && mainProducts.length < 3) wantCategories.push('vegetable');

        for (const cat of wantCategories) {
            const found = this.products.find(p => p.category === cat);
            if (found && !mainProducts.find(m => m.id === found.id)) {
                complements.push(found);
            }
        }

        return complements;
    }

    generateRecipeFromProducts(input) {
        const mainProducts = this.matchProducts(input);
        const complements = this.findComplements(mainProducts);
        const allIngredients = [...mainProducts, ...complements];

        // Determine recipe style from main ingredient
        const hasGrain = allIngredients.some(p => p.category === 'grain');
        const hasMeat = allIngredients.some(p => p.category === 'meat');
        const hasDairy = allIngredients.some(p => p.category === 'dairy');

        let recipeName, intro, steps;

        const mainNames = mainProducts.map(p => p.name).join(' & ') || 'Хосолсон хоол';

        if (hasMeat && hasGrain) {
            recipeName = `${mainNames} жигнэмэг`;
            intro = `Энгийн бөгөөд тэжээллэг ${mainNames}-ийн жигнэмэг. 25 минутад бэлэн болно.`;
            steps = [
                `${mainProducts.find(p=>p.category==='meat')?.name || 'Мах'}-ийг угааж, жижиглэн огтол.`,
                'Тавган дээр тос хийж, дунд зэргийн дулаан дээр хана.',
                'Часнайг шарж, дараа нь мах нэм. 8-10 минут жарна.',
                `${mainProducts.find(p=>p.category==='grain')?.name || 'Будаа'}-г угааж, 2 дахин их ус нэмж чана. 15 мин.`,
                allIngredients.find(p=>p.category==='seasoning') ? `${allIngredients.find(p=>p.category==='seasoning').name}-аар амтална.` : 'Давс, перецээр амтална.',
                'Гаргахдаа будаан дээр махаа тавьж, ногоон ногооны навчаар чимэглэ.'
            ];
        } else if (hasDairy && !hasMeat) {
            recipeName = `${mainNames} омлет`;
            intro = `Хурдан бэлдэх ${mainNames}-ийн өглөөний хоол. 10 минут.`;
            steps = [
                `Өндгийг аяганд хугалж, давс нэмж сайтар цохина.`,
                'Тавган дээр тос хийж, дулааруулна.',
                `${mainProducts.filter(p=>p.category==='vegetable').map(p=>p.name).join(', ')} бол жижиглэж бэлд.`,
                'Өндгийг тавган дээр хийж, ногоо дарс. 3-4 минут жарна.',
                'Нугалж гаргана. Дулаанаар иднэ.'
            ];
        } else {
            recipeName = `${mainNames}-ийн шөл`;
            intro = `Дулаацуулах ${mainNames} шөл. 20 минутад бэлэн.`;
            steps = [
                'Бүх орцыг угааж, жижиглэн огтол.',
                '4 аяга ус буцалган, орцоо нэм.',
                '15 минут дунд дулаанд чана.',
                allIngredients.find(p=>p.category==='sauce') ? `${allIngredients.find(p=>p.category==='sauce').name}-аар амтална.` : 'Давс, перецээр амталж, дулаанаар иднэ.',
            ];
        }

        // Build ingredient list from matched products
        const ingredientList = allIngredients.map(p => ({
            id: p.id,
            name: p.name,
            qty: p.category === 'meat' ? '200г' : p.category === 'grain' ? '1 аяга' : p.category === 'seasoning' ? 'амтаар' : p.category === 'oil' ? '1 хш' : '2 ширхэг',
            price: p.price
        }));

        // Add garlic if not already included
        const hasGarlic = ingredientList.some(i => i.name.toLowerCase().includes('garlic'));
        if (!hasGarlic && this.products.find(p=>p.id==='9')) {
            const garlic = this.products.find(p=>p.id==='9');
            ingredientList.push({ id: garlic.id, name: garlic.name, qty: '2 толгой', price: garlic.price });
        }

        return { title: recipeName, intro, ingredients: ingredientList, steps };
    }

    formatRecipe(recipe) {
        const ingList = recipe.ingredients.map(i => `
            <li style="display:flex; justify-content:space-between; padding:0.3rem 0; border-bottom:1px dashed rgba(0,0,0,0.07);">
                <span>• ${i.name} — <em>${i.qty}</em></span>
                <span style="color:var(--color-primary); font-size:0.8rem;">₮${i.price?.toLocaleString() || '~'}</span>
            </li>
        `).join('');
        const stepList = recipe.steps.map((s, i) => `<li style="margin-bottom:0.4rem;"><strong>${i+1}.</strong> ${s}</li>`).join('');
        const jsonIng = JSON.stringify(recipe.ingredients).replace(/"/g, '&quot;');
        const recipeText = `${recipe.title}\n\nОрц:\n${recipe.ingredients.map(i=>`- ${i.qty} ${i.name}`).join('\n')}\n\nАргачлал:\n${recipe.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')}`;

        return `
            <div class="recipe-card">
                <h3>🍽 ${recipe.title}</h3>
                <p class="intro"><em>${recipe.intro}</em></p>
                <h4>🧂 Орцууд</h4>
                <ul style="list-style:none; padding:0; margin:0.5rem 0;">${ingList}</ul>
                <h4 style="margin-top:0.8rem;">📋 Аргачлал</h4>
                <ol style="padding-left:0; list-style:none;">${stepList}</ol>
                <div class="actions">
                    <button class="btn-add" data-ing="${jsonIng}">🛒 Орцыг сагсанд нэмэх</button>
                    <button class="btn-copy" data-text="${recipeText.replace(/"/g,'&quot;')}">📋 Хуулах</button>
                </div>
            </div>
        `;
    }

    appendMessage(role, htmlContent, save = true) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.innerHTML = role === 'user' ? `<p>${htmlContent}</p>` : htmlContent;

        if (role === 'bot') {
            const addBtn = div.querySelector('.btn-add');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    const ings = JSON.parse(e.target.dataset.ing);
                    document.dispatchEvent(new CustomEvent('add-ingredients', { detail: ings }));
                    e.target.textContent = '✅ Нэмэгдлээ!';
                    e.target.disabled = true;
                });
            }
            const copyBtn = div.querySelector('.btn-copy');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    navigator.clipboard.writeText(e.target.dataset.text);
                    e.target.textContent = '✅ Хуулагдлаа!';
                    setTimeout(() => e.target.textContent = '📋 Хуулах', 2000);
                });
            }
        }

        this.messagesContainer.appendChild(div);
        this.scrollToBottom();

        if (save) {
            this.history.push({ role, content: htmlContent });
            localStorage.setItem('fp_chat_history', JSON.stringify(this.history));
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            @import url('src/styles/variables.css');
            :host {
                display: flex;
                flex-direction: column;
                height: 72vh;
                border: 1px solid var(--color-border);
                border-radius: var(--radius);
                overflow: hidden;
            }
            #messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                background: var(--color-bg);
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .message {
                max-width: 82%;
                padding: 0.8rem 1rem;
                border-radius: 1rem;
                line-height: 1.5;
                font-size: 0.9rem;
            }
            .message.user {
                background: var(--color-primary);
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }
            .message.bot {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                max-width: 90%;
            }
            .input-area {
                display: flex;
                padding: 0.8rem 1rem;
                background: var(--color-surface);
                border-top: 1px solid var(--color-border);
                gap: 0.5rem;
            }
            input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid var(--color-border);
                border-radius: var(--radius);
                background: var(--color-bg);
                color: var(--color-text-main);
                font-size: 0.95rem;
            }
            input:focus { outline: 2px solid var(--color-primary); border-color: transparent; }
            button#send-btn {
                padding: 0 1.4rem;
                background: var(--color-primary);
                color: white;
                border: none;
                border-radius: var(--radius);
                cursor: pointer;
                font-weight: bold;
                font-size: 1rem;
                transition: filter 0.2s;
            }
            button#send-btn:hover { filter: brightness(110%); }

            /* Recipe Card */
            .recipe-card h3 { margin-top: 0; color: var(--color-primary); font-size: 1.05rem; }
            .recipe-card h4 { margin: 0.7rem 0 0.3rem; font-size: 0.9rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
            .recipe-card .intro { color: var(--color-text-muted); font-size: 0.85rem; }
            .recipe-card .actions { margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
            .recipe-card button {
                font-size: 0.8rem;
                padding: 0.4rem 0.8rem;
                border-radius: 4px;
                border: 1px solid var(--color-border);
                background: var(--color-bg);
                color: var(--color-text-main);
                cursor: pointer;
            }
            .recipe-card .btn-add {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }

            /* Suggestion buttons */
            .suggest-btn {
                padding: 0.3rem 0.7rem;
                background: var(--color-primary-light);
                color: var(--color-primary);
                border: 1px solid var(--color-primary);
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.8rem;
            }

            /* Typing dots */
            .typing-dot {
                display: inline-block;
                width: 8px; height: 8px;
                background: var(--color-text-muted);
                border-radius: 50%;
                margin: 0 2px;
                animation: blink 1.2s infinite;
            }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        </style>
        <div id="messages"></div>
        <div class="input-area">
            <input type="text" id="chat-input" placeholder="Орцоо бич... (жишээ: chicken, rice, garlic)">
            <button id="send-btn">➤</button>
        </div>
        `;
    }
}
customElements.define('recipe-chat', RecipeChat);
