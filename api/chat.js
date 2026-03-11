export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Зөвхөн POST зөвшөөрнө.' });

    const { messages, products } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'messages шаардлагатай.' });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY тохируулагдаагүй байна.' });

    // Зөвхөн user/assistant шүүх, сүүлийн 6-г л явуулна
    const filtered = messages
        .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content?.trim());

    const firstUserIdx = filtered.findIndex(m => m.role === 'user');
    if (firstUserIdx < 0) return res.status(400).json({ error: 'Хэрэглэгчийн мэдээлэл байхгүй.' });

    const cleanMessages = filtered.slice(firstUserIdx).slice(-6);

    const systemPrompt = `Чи Jorkhon веб сайтын ChefBot туслах юм.
Зөвхөн монгол хэлээр хариулна уу.
Хэрэглэгчид хоолны рецепт, орцын зөвлөгөө өгнө.
Хариултаа товч, тодорхой, найрсаг байлга.

Дэлгүүрт байгаа бүтээгдэхүүнүүд:
${products?.map(p => `- ${p.name} (₮${p.price?.toLocaleString()})`).join('\n') || 'Мэдээлэл байхгүй'}

Рецепт гаргахдаа дэлгүүрийн бүтээгдэхүүнийг ашиглаж, үнийг нь дурдаж болно.
Орц бүрийн ард [САГС:орцын нэр] гэж бичвэл хэрэглэгч тэр орцыг сагсандаа нэмж чадна.
Жишээ: Өндөг [САГС:Өндөг], Тахиа [САГС:Chicken Breast]`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model:       'llama-3.3-70b-versatile',
                max_tokens:  1024,
                temperature: 0.7,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...cleanMessages
                ]
            })
        });

        if (response.status === 429) {
            return res.status(429).json({ error: 'Хэт олон хүсэлт. 30 секунд хүлээгээд дахин оролдоно уу.' });
        }
        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err.error?.message || 'Groq API алдаа' });
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        return res.status(200).json({ content: text });

    } catch (error) {
        return res.status(500).json({ error: error.message || 'Серверийн алдаа гарлаа.' });
    }
}
