export class PageHome extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="container" style="text-align:center; padding:4rem 1rem;">
                <h1 style="font-size:3rem; color:var(--color-primary); margin-bottom:1rem;">Эрүүл иде. Сайхан амьдар.</h1>
                <p style="font-size:1.2rem; color:var(--color-text-muted); max-width:600px; margin:0 auto 2rem;">
                    Танд байгаа орцоор жор гаргаж өгдөг хувийн тогооч болон дэлгүүрийн туслах. Шинэ орцыг хэдхэн секундэд захиалаарай.
                </p>
                <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
                    <a href="#/chat" class="btn">🍳 Хоол хийж эхлэх</a>
                    <a href="#/grocery" class="btn btn-outline">🛒 Дэлгүүр</a>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:2rem; margin-top:4rem; text-align:left;">
                    <div style="padding:1.5rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-surface);">
                        <h3 style="color:var(--color-accent)">🤖 AI жор</h3>
                        <p style="margin-top:0.5rem; color:var(--color-text-muted);">Танд байгаа орцоо хэл, бид тан руу тохирсон хоолны жор гаргаж өгнө.</p>
                    </div>
                    <div style="padding:1.5rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-surface);">
                        <h3 style="color:var(--color-primary)">🥬 Шинэ бүтээгдэхүүн</h3>
                        <p style="margin-top:0.5rem; color:var(--color-text-muted);">жорийн орцыг нэг товшилтоор сагсандаа нэмж, шуурхай захиалаарай.</p>
                    </div>
                    <div style="padding:1.5rem; border:1px solid var(--color-border); border-radius:var(--radius); background:var(--color-surface);">
                        <h3 style="color:var(--color-accent)">🌙 Харанхуй горим</h3>
                        <p style="margin-top:0.5rem; color:var(--color-text-muted);">Нүдэнд тааламжтай гэрэл/харанхуй горимыг дуртайгаа сонго.</p>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('page-home', PageHome);