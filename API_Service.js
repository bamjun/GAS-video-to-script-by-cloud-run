class TranscribeService {
  processTranscription(fileId, row, param_row) {
    const docId = this.transcribeVideo(fileId);
    this.updateSpreadsheet(docId, row, param_row);
    
    return {
      docId: docId
    };
  }

  transcribeVideo(fileId) {
    return transcribeVideo(fileId); // 기존 transcribeVideo 함수 호출
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
