exports.handler = async function(event, context) {
  // Sécurité : On accepte seulement les requêtes POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Récupérer la clé depuis les variables d'environnement de Netlify (Le coffre-fort)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "La clé API n'est pas configurée dans Netlify." })
      };
    }

    // 2. Lire les données envoyées par ton site web
    const body = JSON.parse(event.body);
    const prompt = body.prompt;
    const systemInstruction = body.system;

    // 3. Appeler Google Gemini depuis le serveur (Invisible pour l'utilisateur)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 4. Renvoyer la réponse à ton site web
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("Erreur serveur:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur interne du serveur ou de connexion à Google." })
    };
  }
};