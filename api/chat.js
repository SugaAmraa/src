export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Зөвхөн POST зөвшөөрнө.' });

    const { messages, products } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'messages шаардлагатай.' });

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('GEMINI_API_KEY байна уу:', !!apiKey);
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY тохируулагдаагүй байна.' });

    // Зөвхөн user/assistant message-үүдийг шүүх
    const filtered = messages
        .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content?.trim())

    const firstUserIdx = filtered.findIndex(m => m.role === 'user');
    if (firstUserIdx < 0) return res.status(400).json({ error: 'Хэрэглэгчийн мэдээлэл байхгүй.' });

    const cleanMessages = filtered.slice(firstUserIdx);

    // Gemini формат: user → user, assistant → model
    const geminiMessages = cleanMessages.map(m => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const systemPrompt = `Чи Jorkhon веб сайтын ChefBot туслах юм.
Зөвхөн монгол хэлээр хариулна уу.
Хэрэглэгчид хоолны рецепт, орцын зөвлөгөө өгнө.
Хариултаа товч, тодорхой, найрсаг байлга.

Дэлгүүрт байгаа бүтээгдэхүүнүүд:
${products?.map(p => `- ${p.name} (₮${p.price?.toLocaleString()})`).join('\n') || 'Мэдээлэл байхгүй'}

Рецепт гаргахдаа дэлгүүрийн бүтээгдэхүүнийг ашиглаж, үнийг нь дурдаж болно.
Орц бүрийн ард [САГС:орцын нэр] гэж бичвэл хэрэглэгч тэр орцыг сагсандаа нэмж чадна.
Жишээ: Өндөг [САГС:Өндөг], Гурил [САГС:Гурил]`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: geminiMessages,
                    generationConfig: {
                        maxOutputTokens: 1024,
                        temperature: 0.7
                    }
                })
            }
        );

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err.error?.message || 'Gemini API алдаа' });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ content: text });

    } catch (error) {
        console.error('Catch алдаа:', error.message);
        return res.status(500).json({ error: error.message || 'Серверийн алдаа гарлаа.' });
    }
}
