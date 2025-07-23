// 檔案路徑: netlify/functions/ecpay-map-return.js (採用重新導向模式)

exports.handler = async function(event, context) {
  // 只處理來自綠界的 POST 請求
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // process.env.URL 會是您 Netlify 網站的網址，例如 https://bamboocoffee-shop-ec.netlify.app
  const checkoutUrl = `${process.env.URL}/checkout.html`;

  try {
    // 綠界回傳的資料是 URL-encoded，我們要先解析
    const params = new URLSearchParams(event.body);
    const cvsStoreId = params.get('CVSStoreID');
    const cvsStoreName = params.get('CVSStoreName');
    const cvsStoreAddress = params.get('CVSAddress'); // 我們多取得地址，讓資訊更完整

    // 如果沒有成功解析出門市ID或名稱，就導向回結帳頁並附上錯誤狀態
    if (!cvsStoreId || !cvsStoreName) {
        console.error('[錯誤] 無法從綠界的回傳中解析出門市資料。');
        return { statusCode: 302, headers: { Location: `${checkoutUrl}?status=store-error` } };
    }

    // 將門市資訊編碼後，放在重新導向的 URL 參數中
    const encodedStoreName = encodeURIComponent(cvsStoreName);
    const encodedStoreAddress = encodeURIComponent(cvsStoreAddress || ''); // 如果地址為空，也做處理
    const redirectUrl = `${checkoutUrl}?status=store-selected&cvsStoreId=${cvsStoreId}&cvsStoreName=${encodedStoreName}&cvsStoreAddress=${encodedStoreAddress}`;

    console.log(`[日誌] 準備將使用者重新導向至: ${redirectUrl}`);

    // 將使用者導回結帳頁面，並附上門市資訊
    return {
      statusCode: 302, // 302 是「重新導向」的標準代碼
      headers: {
        Location: redirectUrl,
      },
    };
  } catch (error) {
    console.error('[錯誤] ecpay-map-return function 發生嚴重錯誤:', error);
    // 即使發生意外，也導回結帳頁並附上錯誤狀態
    return {
      statusCode: 302,
      headers: {
        Location: `${checkoutUrl}?status=server-error`,
      },
    };
  }
};