// 檔案路徑: netlify/functions/ecpay-map-return.js (採用重新導向模式)
exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const checkoutUrl = `${process.env.URL}/checkout.html`;

  try {
    const params = new URLSearchParams(event.body);
    const cvsStoreId = params.get('CVSStoreID');
    const cvsStoreName = params.get('CVSStoreName');
    const cvsStoreAddress = params.get('CVSAddress');

    if (!cvsStoreId || !cvsStoreName) {
        console.error('[錯誤] 無法從綠界的回傳中解析出門市資料。 Body:', event.body);
        return { statusCode: 302, headers: { Location: `${checkoutUrl}?status=store-error` } };
    }

    const encodedStoreName = encodeURIComponent(cvsStoreName);
    const encodedStoreAddress = encodeURIComponent(cvsStoreAddress || '');
    const redirectUrl = `${checkoutUrl}?status=store-selected&cvsStoreId=${cvsStoreId}&cvsStoreName=${encodedStoreName}&cvsStoreAddress=${encodedStoreAddress}`;

    return {
      statusCode: 302,
      headers: { Location: redirectUrl },
    };
  } catch (error) {
    console.error('[錯誤] ecpay-map-return function 發生嚴重錯誤:', error);
    return {
      statusCode: 302,
      headers: { Location: `${checkoutUrl}?status=server-error` },
    };
  }
};