/**
 * 동영상 파일(fileId)을 Cloud Storage로 업로드하고 변환(Cloud Function 위임)한 후,
 * Google Docs에 기록하고 최종적으로 문서 ID를 반환합니다.
 * @param {string} fileId - Google Drive의 동영상 파일 ID
 * @return {string} 새로 생성된 Google Docs 문서 ID
 */
function transcribeVideo(fileId) {
  // 실제 사용 시 fileId를 매개변수로 전달합니다.
  // 테스트용으로 fileId를 하드코딩할 수도 있습니다.
  // fileId = '1GQ0FIaLiRHMdhZGRNUmqEm-1JgOJTXUg';

  var file = DriveApp.getFileById(fileId);
  var videoName = file.getName();

  var bucketName = "meet-temp-speech-to-text";  
  // var token = ScriptApp.getOAuthToken();
  // Logger.log("OAuth 토큰: " + token);
  
  // 1. Google Drive의 파일을 Cloud Function을 통해 Cloud Storage로 업로드 및 변환
  //    이 Cloud Function은 파일을 가져와 Cloud Storage에 업로드하고,
  //    MP4 → FLAC 변환을 수행한 후, FLAC 파일의 gs:// URI와 업로드한 MP4 파일의 이름을 반환해야 합니다.
  // fileId와 bucketName 값을 URL에 쿼리 매개변수로 포함
  var cloudFunctionUrl = "https://fastapi-upload-from-drive-to-gcs-885918267659.asia-northeast3.run.app/uploadFromDriveToGCS" +
                          "?fileId=" + encodeURIComponent(fileId) +
                          "&bucketName=" + encodeURIComponent(bucketName);

  // HTTP 요청 옵션 (POST 방식 대신 GET 방식으로 호출할 수도 있음)
  // 만약 POST로 쿼리 매개변수를 보내고 싶다면, method: "post"로 지정해도 됩니다.

  var cfOptions = {
    method: "get",  // 또는 "post"
    // headers: {
    //   "Authorization": "Bearer " + token
    // },
    muteHttpExceptions: true
    };
  

  var cfResponse = UrlFetchApp.fetch(cloudFunctionUrl, cfOptions);
  var cfResult = JSON.parse(cfResponse.getContentText());
  Logger.log(cfResult)


  var transcription = cfResult.transcription;
  
  
  // 4. 전사 결과를 새 Google Docs에 기록 (화자별 대화 형식)
  var doc = DocumentApp.create("음성 to 텍스트 - " + videoName);
  var body = doc.getBody();
  body.appendParagraph("Transcription for video: " + videoName);
  body.appendParagraph(transcription);
  
  
  return doc.getId();
}




