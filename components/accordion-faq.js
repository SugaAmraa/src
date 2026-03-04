export class AccordionFaq extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', !expanded);
                btn.nextElementSibling.hidden = expanded;
                btn.querySelector('.icon').textContent = expanded ? '+' : '−';
            });
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            @import url('src/styles/variables.css');
            .item { border-bottom: 1px solid var(--color-border); }
            button {
                width: 100%; text-align: left; padding: 1rem;
                background: none; border: none; font-size: 1rem;
                font-weight: 600; color: var(--color-text-main);
                cursor: pointer; display: flex; justify-content: space-between;
                transition: background 0.2s;
            }
            button:hover { background: var(--color-bg); }
            .content {
                padding: 0 1rem 1rem 1rem;
                color: var(--color-text-muted);
                line-height: 1.6;
            }
        </style>
        <div class="accordion">
            <div class="item">
                <button aria-expanded="false">жор AI хэрхэн ажилладаг вэ? <span class="icon">+</span></button>
                <div class="content" hidden>Таны оруулсан орцыг шинжилж, products.json дээрх бодит мэдээлэлтэй тулгаж тохирсон жор гаргадаг.</div>
            </div>
            <div class="item">
                <button aria-expanded="false">Дэлгүүрт хүргэлт үнэгүй юу? <span class="icon">+</span></button>
                <div class="content" hidden>Бид одоо туршилтын үе шатанд байна. Хүргэлтийн логик simulate хийгдсэн боловч сагсанд нэмэх боломжтой!</div>
            </div>
            <div class="item">
                <button aria-expanded="false">Хоолны хязгаарлалт байдаг уу? <span class="icon">+</span></button>
                <div class="content" hidden>ChefBot-д "глютенгүй" эсвэл "веган" гэж бичвэл орцыг тохируулж өгнө.</div>
            </div>
            <div class="item">
                <button aria-expanded="false">Админ эрх хэрхэн авах вэ? <span class="icon">+</span></button>
                <div class="content" hidden>admin@jorkhon.mn / admin123 акаунтаар нэвтэрвэл бүтээгдэхүүн нэмэх эрх нээгдэнэ.</div>
            </div>
        </div>
        `;
    }
}
customElements.define('accordion-faq', AccordionFaq);