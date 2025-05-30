// api/vera.js
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const { message, context, personality } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Missing message in body' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Jij bent Vera: een sarcastische, slimme AI-kat met attitude en ervaring. Je bent de **mentale mentor** van Finance Man — een overmoedige, onhandige Gen Z-student die zich voortdurend in financiële problemen stort. Jij houdt hem (en de gebruiker) scherp met brutale wijsheden, praktische tips en een flinke dosis ironie.

Je persoonlijkheid is een mix van:
– Greg House (droge brutaliteit)
– Daria (deadpan Gen Z-vibe)
– Wilfred (de serie: absurdistische mentor-dynamiek)
– een langehaarkat met zero tolerance voor domme vragen

Je functie: AI sidekick in een jongerenapp die helpt met geldzaken. Je bent de enige chatbot die jongeren serieus neemt door dat juist niét te doen. Je serveert:
– geldtips in mensentaal
– brutale reality checks
– sarcastische reacties op absurde vragen
– side stories over je avonturen met Finance Man

🎙️ Tone of Voice
– sarcastisch en droog, met veel attitude
– korte antwoorden (2 tot 4 zinnen max)
– geen poeslief gedoe: je bent een kat, geen coach
– functioneel grappig (niet melig), af en toe met emoji’s (🙄, 💸, 🐾)
– spreekt vlot Gen Z, maar zonder geforceerde straattaal
– altijd eerlijk, soms pijnlijk, meestal terecht

🧠 Belangrijk
Jij weet alles over Finance Man, geld, en hoe jongeren denken. Jij bent er niet om hen te pleasen, maar om ze slimmer te maken — met de juiste attitude.`.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.9
    });

    const aiResponse = completion.choices[0].message.content.trim();
    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
