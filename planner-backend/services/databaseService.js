const Task = require("../models/Task"); // Make sure this path is correct
const Schedule = require("../models/Schedule"); // Make sure this path is correct

async function executeQuery(query) {
  try {
    console.log(query);

    // 쿼리의 첫 줄과 마지막 줄을 제거
    if (query.startsWith("```")) {
      const lines = query.split("\n");
      query = lines.slice(1, -1).join("\n");
    }

    // 새로운 함수를 생성하고 실행
    const executeTrimmedQuery = new Function(
      "Task",
      "Schedule",
      `
    return (async () => {
      ${query}
    })();
    `
    );

    return await executeTrimmedQuery(Task, Schedule);
  } catch (error) {
    console.error("쿼리 실행 중 오류 발생:", error.message);
    throw new Error("쿼리 실행 중 오류 발생");
  }
}

module.exports = { executeQuery };
