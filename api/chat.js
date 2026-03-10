export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Зөвхөн POST зөвшөөрнө.' });
    }

    const { messages, products } = req.body;
    if (!messages?.length) {
        return res.status(400).json({ error: 'messages шаардлагатай.' });
    }

    // Зөвхөн user/assistant role-тай, зөв ээлжтэй message-үүдийг шүүнэ
    // Anthropic: эхний message заавал 'user' байна, давтагдсан role байж болохгүй
    const filtered = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .filter(m => m.content?.trim());

    // Эхний user message хүртэл assistant message-үүдийг хасна
    const firstUserIdx = filtered.findIndex(m => m.role === 'user');
    const cleanMessages = firstUserIdx >= 0 ? filtered.slice(firstUserIdx) : [];

    if (!cleanMessages.length) {
        return res.status(400).json({ error: 'Хэрэглэгчийн мэдээлэл байхгүй.' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type':         'application/json',
                'x-api-key':            process.env.ANTHROPIC_API_KEY,
                'anthropic-version':    '2023-06-01'
            },
            body: JSON.stringify({
                model:      'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: `Чи Jorkhon веб сайтын ChefBot туслах юм. 
Зөвхөн монгол хэлээр хариулна уу.
Хэрэглэгчид хоолны рецепт, орцын зөвлөгөө өгнө.
Хариултаа товч, тодорхой, найрсаг байлга.

Дэлгүүрт байгаа бүтээгдэхүүнүүд:
${products?.map(p => `- ${p.name} (₮${p.price?.toLocaleString()})`).join('\n') || 'Мэдээлэл байхгүй'}

Рецепт гаргахдаа дэлгүүрийн бүтээгдэхүүнийг ашиглаж, үнийг нь дурдаж болно.
Орц бүрийн ард [САГС] гэж бичвэл хэрэглэгч тэр орцыг сагсандаа нэмж чадна.`,
                messages: cleanMessages
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err.error?.message || 'API алдаа' });
        }

        const data = await response.json();
        return res.status(200).json({ content: data.content[0]?.text || '' });

    } catch (error) {
        return res.status(500).json({ error: 'Серверийн алдаа гарлаа.' });
    }
}
