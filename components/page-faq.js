import './accordion-faq.js';

export class PageFaq extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="container" style="max-width:800px;">
                <h2 style="margin-bottom:1.5rem;">❓ Түгээмэл асуултууд</h2>
                <accordion-faq></accordion-faq>
            </div>
        `;
    }
}
customElements.define('page-faq', PageFaq);