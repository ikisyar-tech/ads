import bridge from '@vkontakte/vk-bridge';

let accessToken = null;

// Запрашиваем токен при старте
export async function authorize() {
  try {
    const data = await bridge.send('VKWebAppGetAuthToken', {
      app_id: 54566958, // ⚠️ ЗАМЕНИТЕ на ID вашего приложения (число)
      scope: 'groups,wall,newsfeed', // права
    });
    accessToken = data.access_token;
    return accessToken;
  } catch (e) {
    console.error('Ошибка авторизации:', e);
    throw new Error('Не удалось получить доступ к данным ВК');
  }
}

export async function callVKApi(method, params = {}) {
  if (!accessToken) {
    throw new Error('Нет токена доступа. Вызовите authorize() сначала.');
  }
  const response = await bridge.send('VKWebAppCallAPIMethod', {
    method,
    params: {
      v: '5.131',
      access_token: accessToken, // передаём токен
      ...params,
    },
  });
  if (response.data?.error) {
    throw new Error(response.data.error.error_msg || 'Ошибка API');
  }
  return response.data;
}

export async function getGroups() {
  const data = await callVKApi('groups.get', {
    extended: 1,
    fields: 'name,photo_50',
    count: 100,
  });
  return data.items;
}

export async function getFeed() {
  const data = await callVKApi('newsfeed.get', {
    filters: 'post',
    count: 50,
  });
  return data.items;
}
