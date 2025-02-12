class TranscribeService {
  processTranscription(fileId, row, param_row) {
    const docId = this.transcribeVideo(fileId);
    this.updateSpreadsheet(docId, row, param_row);
    
    return {
      docId: docId
    };
  }

  // 수정된 transcribeVideo 메서드: 기존 함수 호출 대신 직접 구현
  transcribeVideo(fileId) {
    // Google Drive에서 파일 정보를 가져옴
    var file = DriveApp.getFileById(fileId);
    var videoName = file.getName();
    var bucketName = "meet-temp-speech-to-text";

    // Cloud Function URL 구성 (파일 업로드 및 변환 요청)
    var cloudFunctionUrl = "https://fastapi-upload-from-drive-to-gcs-885918267659.asia-northeast3.run.app/uploadFromDriveToGCS" +
                           "?fileId=" + encodeURIComponent(fileId) +
                           "&bucketName=" + encodeURIComponent(bucketName);

    // HTTP 요청 옵션 설정
    var cfOptions = {
      method: "get",
      muteHttpExceptions: true
    };

    // Cloud Function 호출 및 결과 파싱
    var cfResponse = UrlFetchApp.fetch(cloudFunctionUrl, cfOptions);
    var cfResult = JSON.parse(cfResponse.getContentText());
    Logger.log(cfResult);

    // 전사 결과 추출
    var transcription = cfResult.transcription;

    // Google Docs 문서를 생성하고 전사 결과 기록
    var doc = DocumentApp.create("음성 to 텍스트 - " + videoName);
    var body = doc.getBody();
    body.appendParagraph("Transcription for video: " + videoName);
    body.appendParagraph(transcription);

    return doc.getId();
  }

  updateSpreadsheet(docId, row, param_row) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    // 문서 ID 설정
    sheet.getRange(row, 5).setValue(docId);

    // 문서 링크 설정
    const docUrl = "https://docs.google.com/document/d/" + docId + "/edit";
    const hyperlinkFormula = '=HYPERLINK("' + docUrl + '", "바로가기")';
    sheet.getRange(row, 6).setFormula(hyperlinkFormula);

    // AI 변환 링크 설정
    const url = WEBAPP_URL + "?action=aiPrompt&fileId=" + docId + "&row=" + param_row;
    const hyperlinkFormulaForAI = '=HYPERLINK("' + url + '", "변환")';
    sheet.getRange(row, 7).setFormula(hyperlinkFormulaForAI);
  }
}


class AiPromptService {
  processAiPrompt(fileId, row, param_row) {
    // fileid 는 docid 이다. 
    // fileid 를 이용해서 doc 를 가져온다. 
    // doc내용을 cound run ai-prompt 으로 바디값 prompt 로 보낸다. 
    // 응답을 받는다. 
    // 응답을 스프레드시트에 기록한다. 
    const docId = this.aiPromptVideo(fileId);
    this.updateSpreadsheet(docId, row, param_row);

    return {
      docId: docId
    }; // 기존 processAiPrompt 함수 호출
  }

  aiPromptVideo(fileId) {
    const doc = DocumentApp.openById(fileId);
    const body = doc.getBody();
    const prompt = body.getText();
    const response = UrlFetchApp.fetch("https://fastapi-ai-prompt-885918267659.asia-northeast3.run.app/ai-prompt", {
      method: "post",
      payload: { prompt: prompt }
    });
    const responseText = response.getContentText();
    return responseText;
  }

  updateSpreadsheet(docId, row, param_row) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    sheet.getRange(row, 8).setValue(responseText);
  }
}


