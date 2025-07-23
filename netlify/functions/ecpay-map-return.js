// 檔案路徑: netlify/functions/ecpay-map-return.js

const querystring = require('querystring');

exports.handler = async (event, context) => {
  // 綠界回傳的資料是 URL-encoded，我們要先解析
  const storeData = querystring.parse(event.body);
  console.log('收到綠界回傳的門市資料:', storeData);

  // 我們只回傳一段簡單的 HTML，裡面包含一小段 JavaScript
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>處理中...</title>
      <script>
        // 當這個頁面載入時，執行以下動作
        window.onload = function() {
          // 準備要傳送的資料物件
          const message = {
            action: 'ecpayStoreSelected',
            store: ${JSON.stringify(storeData)}
          };
          
          // 將資料傳送給開啟這個視窗的父視窗 (也就是 checkout.html)
          // '*' 表示允許傳送到任何來源，基於安全考量，正式上線時應更換為您的網站網域
          window.opener.postMessage(message, '*');
          
          // 關閉自己這個彈出視窗
          window.close();
        };
      </script>
    </head>
    <body>
      <p>資料處理中，請稍候...</p>
    </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: htmlResponse,
  };
};