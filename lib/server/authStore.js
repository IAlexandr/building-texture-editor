export default function () {
  return {
    getAccessTypes(done) {
      done(null, []);
    },
    getUsers(done) {
      done(null, [
        {
          id: 'admin',
          name: 'admin',
          displayName: 'Администратор',
          "passwordHash": "202cb962ac59075b964b07152d234b70",
        },
        {
          id: 'user1',
          name: 'user1',
          displayName: 'Ольга',
          "passwordHash": "202cb962ac59075b964b07152d234b70",
        },
        {
          id: 'user2',
          name: 'user2',
          displayName: 'Пользователь 2',
          "passwordHash": "202cb962ac59075b964b07152d234b70",
        },
        {
          id: 'user3',
          name: 'user3',
          displayName: 'Пользователь 3',
          "passwordHash": "202cb962ac59075b964b07152d234b70",
        }
      ]);
    },
    getRoles(done) {
      done(null, [
        {
          id: 'roleAdmin',
          name: 'admin',
          accessPermissions: {
            checking: true,
            editing: true
          },
          userIds: ['admin']
        },
        {
          name: 'user',
          id: 'roleUser',
          accessPermissions: {
            editing: true
          },
          userIds: ['user1', 'user2', 'user3']
        }
      ]);
    },
  };
}
