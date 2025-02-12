/**
 * 웹앱 엔드포인트로서 doGet() 함수가 호출되면,
 * URL 파라미터 (fileId, row)를 읽어 동영상 전사 함수를 실행하고,
 * 해당 행의 열 E와 F에 결과를 업데이트합니다.
 *
 * @param {Object} e - 요청 URL 파라미터 객체
 * @return {ContentService.TextOutput} 처리 결과 텍스트
 */
function doGet(e) {
  var action = e.parameter.action;

  switch (action) {
    case "transcribe":
      return handleTranscribe(e);
    case "aiPrompt":
      return handleAiPrompt(e);
    default:
      return ContentService.createTextOutput("Invalid action parameter");
  }
}

function handleTranscribe(e) {
  const validation = RequestSchema.validateTranscribeParams(e.parameter);
  const validationResponse = RequestSchema.createValidationResponse(validation);
  if (validationResponse) return validationResponse;
  
  const transcribeService = new TranscribeService();
  const result = transcribeService.processTranscription(
    validation.data.fileId,
    validation.data.row,
    validation.data.rawRow
  );
  
  return ContentService.createTextOutput("전사 완료. Doc ID: " + result.docId);
}

function handleAiPrompt(e) {
  const validation = RequestSchema.validateAiPromptParams(e.parameter);
  const validationResponse = RequestSchema.createValidationResponse(validation);
  if (validationResponse) return validationResponse;

  const aiPromptService = new AiPromptService();
  const result = aiPromptService.processAiPrompt(
    validation.data.fileId,
    validation.data.row,
    validation.data.rawRow
  );

  // AI 프롬프트 처리 로직
  return ContentService.createTextOutput("AI 프롬프트 처리 완료. Doc ID: " + result.docId);
}
