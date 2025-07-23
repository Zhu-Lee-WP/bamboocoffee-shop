// 檔案路徑: netlify/functions/ecpay-map-return.js (postMessage 最終版)
const querystring = require('querystring');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const storeData = querystring.parse(event.body);
  console.log('收到綠界回傳的門市資料:', storeData);

  const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>處理中...</title>
      <script>
        window.onload = function() {
          const message = {
            action: 'ecpayStoreSelected',
            store: ${JSON.stringify(storeData)}
          };
          window.opener.postMessage(message, '*');
          window.close();
        };
      </script>
    </head>
    <body><p>資料處理中，請稍候...</p></body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: htmlResponse,
  };
};