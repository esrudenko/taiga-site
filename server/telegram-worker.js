export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return reply({ ok: false, error: "Method not allowed" }, 405);

    let data;
    try {
      data = await request.json();
    } catch {
      return reply({ ok: false, error: "Bad JSON" }, 400);
    }

    const clean = (value, max) => String(value ?? "").trim().slice(0, max);
    const name = clean(data.name, 60);
    const contact = clean(data.contact, 100);
    if (name.length < 2 || contact.length < 3) return reply({ ok: false, error: "Missing fields" }, 400);

    const methods = { phone: "Звонок", telegram: "Telegram", whatsapp: "WhatsApp", email: "Email" };
    const text = [
      "Новая заявка с сайта TAIGA",
      `Имя: ${name}`,
      `Связаться: ${methods[data.method] ?? "—"}, ${contact}`,
      `Сообщение: ${clean(data.message, 1000) || "—"}`,
      `Страница: ${clean(data.page, 100)}`,
    ].join("\n");

    const telegram = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text }),
    });

    return telegram.ok ? reply({ ok: true }) : reply({ ok: false, error: "Telegram error" }, 502);
  },
};
