import React, { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, Panel, PanelHeader, Group, Cell, Button, Div, Spinner, Snackbar } from '@vkontakte/vkui';
import { Icon24Done } from '@vkontakte/icons';
import { authorize, getGroups, getFeed } from './api';

function App() {
  const [activePanel, setActivePanel] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    bridge.send('VKWebAppInit');
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // 1. Авторизуемся (получаем токен)
      await authorize();
      // 2. Загружаем данные
      await Promise.all([loadGroups(), loadFeed()]);
    } catch (e) {
      setSnackbar({ text: e.message || 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (e) {
      setSnackbar({ text: 'Не удалось загрузить группы: ' + e.message });
    }
  };

  const loadFeed = async () => {
    try {
      const data = await getFeed();
      setFeed(data);
    } catch (e) {
      setSnackbar({ text: 'Не удалось загрузить ленту: ' + e.message });
    }
  };

  const openVK = (url) => {
    bridge.send('VKWebAppOpenURL', { url });
  };

  if (loading) {
    return (
      <View activePanel="loading">
        <Panel id="loading">
          <PanelHeader>Загрузка</PanelHeader>
          <Div style={{ textAlign: 'center', paddingTop: 40 }}>
            <Spinner size="large" />
            <p>Получение доступа к данным...</p>
          </Div>
        </Panel>
      </View>
    );
  }

  return (
    <View activePanel={activePanel}>
      <Panel id="groups">
        <PanelHeader>Мои подписки</PanelHeader>
        <Group>
          {groups.length === 0 ? (
            <Div>Нет групп или не удалось загрузить</Div>
          ) : (
            groups.map((g) => (
              <Cell
                key={g.id}
                before={<img src={g.photo_50} alt="" width={36} height={36} />}
                description={g.name}
                asideContent={
                  <Button
                    size="s"
                    mode="outline"
                    onClick={() => openVK(`https://vk.com/club${g.id}`)}
                  >
                    Отписаться
                  </Button>
                }
              >
                {g.name}
              </Cell>
            ))
          )}
        </Group>
        <Div>
          <Button size="l" stretched onClick={() => setActivePanel('feed')}>
            Перейти к ленте
          </Button>
        </Div>
      </Panel>

      <Panel id="feed">
        <PanelHeader>Лента</PanelHeader>
        <Group>
          {feed.length === 0 ? (
            <Div>Нет постов или не удалось загрузить</Div>
          ) : (
            feed.map((post) => (
              <Cell
                key={post.id}
                description={post.text ? post.text.slice(0, 100) : 'Пост без текста'}
                asideContent={
                  <Button
                    size="s"
                    mode="outline"
                    onClick={() => openVK(`https://vk.com/wall${post.owner_id}_${post.id}`)}
                  >
                    Лайкнуть
                  </Button>
                }
              />
            ))
          )}
        </Group>
        <Div>
          <Button size="l" stretched onClick={() => setActivePanel('groups')}>
            Назад к подпискам
          </Button>
        </Div>
      </Panel>

      {snackbar && (
        <Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon24Done />}
        >
          {snackbar.text}
        </Snackbar>
      )}
    </View>
  );
}

export default App;
