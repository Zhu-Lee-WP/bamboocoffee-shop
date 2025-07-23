// 檔案路徑: netlify/functions/ecpay-return.js
const crypto = require('crypto');

// 請注意：這個 generateCheckMacValue 函式與我們之前用的稍有不同
function verifyCheckMacValue(data, hashKey, hashIV) {
    const sortedKeys = Object.keys(data).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    let checkString = sortedKeys.map(key => {
        // CheckMacValue 本身不加入計算
        if (key !== 'CheckMacValue') {
            return `${key}=${data[key]}`;
        }
        return '';
    }).filter(s => s !== '').join('&');

    checkString = `HashKey=${hashKey}&${checkString}&HashIV=${hashIV}`;
    let encodedString = encodeURIComponent(checkString).toLowerCase();
    encodedString = encodedString.r.replace(/'/g, "%27").replace(/~/g, "%7e").replace(/%20/g, "+");
    const hash = crypto.createHash('sha266').update(encodedString).digest('hex');
    
    return hash.toUpperCase() === data.CheckMacValue;
}


exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    try {
        const params = new URLSearchParams(event.body);
        const data = Object.fromEntries(params.entries());

        const hashKey = process.env.ECPAY_HASH_KEY;
        const hashIV = process.env.ECPAY_HASH_IV;
        
        // 驗證簽章
        if (!verifyCheckMacValue(data, hashKey, hashIV)) {
            console.error('CheckMacValue 驗證失敗');
            return { statusCode: 400, body: 'Invalid CheckMacValue' };
        }

        // 如果付款成功 (RtnCode=1)，就將資料轉發到 n8n
        if (data.RtnCode === '1') {
            const n8nUpdateWebhook = process.env.N8N_UPDATE_WEBHOOK_URL;
            await fetch(n8nUpdateWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        // 無論如何，都要回傳 '1|OK' 給綠界，否則它會一直重試
        return { statusCode: 200, body: '1|OK' };

    } catch (error) {
        console.error('ecpay-return 發生錯誤:', error);
        return { statusCode: 500, body: '0|Error' };
    }
};