const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callOpenAI(prompt, model) {
  try {
    let messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-o",
      // model === "gpt-4-desk-model"
      //   ? "ft:gpt-3.5-turbo-0125:wellcomlab::9UCQgz0f"
      //   : "ft:gpt-3.5-turbo-0125:wellcomlab::9UVXuSD0",
      messages,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(
      "OpenAI API 호출 중 오류 발생:",
      error.response ? error.response.data : error.message
    );
    throw new Error("OpenAI API 호출 중 오류 발생");
  }
}
module.exports = { callOpenAI };
