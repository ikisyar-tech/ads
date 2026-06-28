import React, { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, Panel, PanelHeader, Group, Cell, Button, Div, Snackbar } from '@vkontakte/vkui';
import { Icon24Done } from '@vkontakte/icons';
import { getGroups, getFeed } from './api';

function App() {
  const [activePanel, setActivePanel] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [feed, setFeed] = useState([]);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    bridge.send('VKWebAppInit');
    loadGroups();
    loadFeed();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (e) {
      setSnackbar({ text: 'Не удалось загрузить группы' });
    }
  };

  const loadFeed = async () => {
    try {
      const data = await getFeed();
      setFeed(data);
    } catch (e) {
      setSnackbar({ text: 'Не удалось загрузить ленту' });
    }
  };

  const openVK = (url) => {
    bridge.send('VKWebAppOpenURL', { url });
  };

  return (
    <View activePanel={activePanel}>
      <Panel id="groups">
        <PanelHeader>Мои подписки</PanelHeader>
        <Group>
          {groups.map((g) => (
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
          ))}
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
          {feed.map((post) => (
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
          ))}
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
