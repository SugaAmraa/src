export class PageAbout extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="container" style="max-width:800px;">
                <h1 style="color:var(--color-primary);">Jorkhon тухай</h1>
                <p style="margin:1rem 0; font-size:1.1rem; line-height:1.6;">
                    <strong>Jorkhon</strong> нь <strong>Vanilla JavaScript болон Web Components</strong> технологийн хүчийг харуулах зорилготой концепц төсөл юм.
                    Бид орчин үеийн веб хөгжүүлэлт нь заавал хүнд framework шаарддаггүй гэдэгт итгэдэг.
                </p>
                <h3 style="margin-top:2rem;">Манай зорилго</h3>
                <p style="margin-top:0.5rem; color:var(--color-text-muted);">Хөнгөн, гүйцэтгэлтэй веб дээр эрүүл хоолны санааг болон дэлгүүртэй нэгтгэсэн туршлага олгох.</p>

                <h3 style="margin-top:2rem;">Технологийн стек</h3>
                <ul style="padding-left:1.5rem; margin-top:0.5rem; color:var(--color-text-muted); line-height:2;">
                    <li>ES Modules</li>
                    <li>Web Components (Custom Elements, Shadow DOM)</li>
                    <li>CSS Variables (HSL)</li>
                    <li>Hash-based клиент талын чиглүүлэлт</li>
                    <li>Google Identity Services (OAuth 2.0)</li>
                </ul>

                <h3 style="margin-top:2rem;">Хэрэглэгчийн эрх</h3>
                <div style="margin-top:0.5rem; display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div style="padding:1rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-surface);">
                        <strong>👤 Ердийн хэрэглэгч</strong>
                        <ul style="padding-left:1.2rem; margin-top:0.5rem; color:var(--color-text-muted); font-size:0.9rem; line-height:1.8;">
                            <li>ChefBot-оор жор авах</li>
                            <li>Дэлгүүрийн бүтээгдэхүүн харах</li>
                            <li>Сагсанд нэмэх, захиалах</li>
                        </ul>
                    </div>
                    <div style="padding:1rem; border:1px solid var(--color-primary); border-radius:var(--radius); background:var(--color-surface);">
                        <strong style="color:var(--color-primary);">🔒 Админ</strong>
                        <ul style="padding-left:1.2rem; margin-top:0.5rem; color:var(--color-text-muted); font-size:0.9rem; line-height:1.8;">
                            <li>Бүтээгдэхүүн нэмэх, засах</li>
                            <li>Ердийн хэрэглэгчийн бүх эрх</li>
                        </ul>
                        <p style="font-size:0.78rem; margin-top:0.5rem; color:var(--color-text-muted);">admin@jorkhon.mn / admin123</p>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('page-about', PageAbout);