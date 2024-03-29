
import axios from 'axios';

async function authorization() {
    const storage = localStorage;

    let hasLogin = false;
    let username = storage.getItem('username.center');

    const expiredTime = Number(storage.getItem('expiredTime.center'));
    const current = (new Date()).getTime();
    const refreshToken = storage.getItem('refresh.center');

    // 初始 token 未过期
    if (expiredTime > current) {
        hasLogin = true;
        console.log('authorization access')
    }
    // 初始 token 过期
    // 申请刷新 token
    else if (refreshToken !== null) {
        try {
            let response = await axios.post(process.env.VUE_APP_API_URL+'api/token/refresh/', {refresh: refreshToken});

            const nextExpiredTime = Date.parse(response.headers.date) + 60000;

            storage.setItem('access.center', response.data.access);
            storage.setItem('expiredTime.center', nextExpiredTime);
            storage.removeItem('refresh.center');

            hasLogin = true;

            console.log('authorization refresh')
        }
        catch (err) {
            storage.clear();
            hasLogin = false;

            console.log('authorization err')
        }
    }
    // 无任何有效 token
    else {
        storage.clear();
        hasLogin = false;
        console.log('authorization exp')
    }

    console.log('authorization done');

    return [hasLogin, username]
}

export default authorization;