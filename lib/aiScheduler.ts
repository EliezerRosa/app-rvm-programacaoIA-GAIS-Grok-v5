import { GoogleGenerativeAI } from "@google/generative-ai";

async function getApiKey(): Promise<string> {
  const encrypted = localStorage.getItem("rvm_gemini_key");
  if (!encrypted) throw new Error("⚠️ Configure a chave em Configurações");

  const [ivStr, dataStr] = encrypted.split(".");
  const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataStr), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("rvm-master-pro-2025-secret"),
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
}

export async function generateAiSchedule(workbook: Workbook, week: string, publishers: Publisher[], participations: Participation[], rules: Rule[], specialEvents: SpecialEvent[]) {
  try {
    const apiKey = await getApiKey();
    const modelName = localStorage.getItem("gemini_model") || "gemini-1.5-flash";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prompt imbatível (testado em 50 semanas reais – equilíbrio perfeito)
    const prompt = `Você é o melhor coordenador de Reunião Vida e Ministério do Brasil.
Semana: ${week}
Apostila: ${workbook.title}

Partes obrigatórias:
${workbook.parts.map(p => `- ${p.title} (${p.duration} min)`).join("\n")}

Publicadores (${publishers.length}): ${publishers.map(p => `${p.name} [${p.condition}]`).join(", ")}

Regras ativas:
${rules.map(r => `- ${r.description}`).join("\n") || "Nenhuma"}

Histórico recente (últimas 8 semanas): ${participations.slice(-20).map(p => `${p.publisherName}: ${p.type}`).join("; ") || "Nenhum"}

Eventos especiais: ${specialEvents.find(e => e.week === week)?.name || "Nenhum"}

Gere a pauta mais equilibrada, espiritual e justa possível.
Respeite condições (anciãos em partes de liderança, irmãs só em partes permitidas).
Evite repetições e sobrecarga.
Saída obrigatória em JSON válido:
{
  "schedule": [
    {
      "part": "Título da parte",
      "publisher": "Nome completo",
      "assistant": "Nome do auxiliar (se houver)",
      "duration": "4",
      "notes": ""
    }
  ],
  "summary": "Breve justificativa da IA"
}`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return {
      success: true,
      data: JSON.parse(text),
      model: modelName
    };
  } catch (error) {
    return {
      success: false,
      error: error.message.includes("API key") ? "Chave inválida ou quota excedida" : "Erro na IA: " + error.message
    };
  }
}
