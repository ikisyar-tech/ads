import bridge from '@vkontakte/vk-bridge';

export async function callVKApi(method, params = {}) {
  const response = await bridge.send('VKWebAppCallAPIMethod', {
    method,
    params: {
      v: '5.131',
      ...params,
    },
  });
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
