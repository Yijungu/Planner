const { callOpenAI } = require("../services/openaiService");
const fs = require("fs");
const OpenAI = require("openai");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processCommand(req, res) {
  try {
    const { command } = req.body; // file은 음성 파일 (MP3)

    // 첫 번째 AI 호출 (데스크 AI 모델 사용)
    let aiResponse = await callOpenAI(command, "gpt-4-desk-model");
    let parsedResponse;
    try {
      parsedResponse = aiResponse;
    } catch (e) {
      return res
        .status(500)
        .send({ message: "AI 응답을 파싱하는 중 오류 발생" });
    }

    // 클라이언트 응답 처리
    if (parsedResponse) {
      if (parsedResponse.includes("담당관")) {
        const dataManagerCommandMatch =
          parsedResponse.match(/데이터 담당관: (.*)/);
        if (dataManagerCommandMatch) {
          const dataManagerCommand = dataManagerCommandMatch[1];
          const agentCommand = `에이전트: ${dataManagerCommand}`;

          // 데이터 담당관 부분을 제거한 텍스트
          const clientResponse = parsedResponse
            .replace(/데이터 담당관: .*/, "")
            .trim();

          // 텍스트 응답을 음성으로 변환
          const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: clientResponse,
          });

          const buffer = Buffer.from(await mp3.arrayBuffer());
          const audioBase64 = buffer.toString("base64");
          console.log("parsedResponse1 : ", parsedResponse);
          // JSON 응답으로 음성 데이터와 추가 데이터 전송
          return res.status(200).json({
            response: parsedResponse,
            additionalResponse: true,
            agentCommand: agentCommand,
            audioBase64: audioBase64,
          });
        } else {
          const dummyFilePath = path.resolve("/path/to/dummy/response.mp3"); // 더미 경로
          const dummyFileBuffer = fs.readFileSync(dummyFilePath);
          const dummyAudioBase64 = dummyFileBuffer.toString("base64");
          console.log("parsedResponse2 : ", parsedResponse);
          return res.status(200).json({
            response: parsedResponse,
            additionalResponse: true,
            audioBase64: dummyAudioBase64,
          });
        }
      } else {
        // 텍스트 응답을 음성으로 변환
        console.log("parsedResponse3 : ", parsedResponse);
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input: parsedResponse,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const audioBase64 = buffer.toString("base64");

        // JSON 응답으로 음성 데이터 전송
        return res.status(200).json({
          response: parsedResponse,
          additionalResponse: false,
          audioBase64: audioBase64,
        });
      }
    }

    return res.status(500).send({ message: "알 수 없는 AI 응답 형식" });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function processAdditionalCommand(req, res) {
  try {
    const { command } = req.body;
    const userId = req.user ? req.user.userId : "test_user_id"; // 사용자 인증 없을 때 기본값
    console.log("command", command);
    // 두 번째 AI 호출 (데이터베이스 AI 모델 사용)
    let dbAiResponse = await callOpenAI(command, "gpt-4-database-model");
    console.log("dbAiResponse", dbAiResponse);
    // AI로부터 생성된 쿼리 실행
    const query = dbAiResponse.replace("<USER_ID>", userId);
    const result = await executeQuery(query);
    console.log("result", result);

    // 결과를 다시 데이터베이스 AI 모델에 보내기
    let intermediatePrompt = `데이터베이스 : ${JSON.stringify(result)}`;
    let intermediateResponse = await callOpenAI(
      intermediatePrompt,
      "gpt-4-database-model"
    );

    // 결과를 다시 데스크 AI 모델에 보내기
    let finalPrompt = `데이터베이스 담당관 : ${intermediateResponse}`;
    let finalResponse = await callOpenAI(finalPrompt, "gpt-4-desk-model");

    // 텍스트 응답을 음성으로 변환
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: finalResponse,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const audioBase64 = buffer.toString("base64");

    // JSON 응답으로 음성 데이터 전송
    return res.status(200).json({
      response: finalResponse,
      audioBase64: audioBase64,
    });
  } catch (error) {
    console.log("error");
    res.status(500).send(error.message);
  }
}

module.exports = {
  processCommand,
  processAdditionalCommand,
};
