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
          displayName: 'Администратор', // Inf
          "passwordHash": "03b7c5dc102fc4fb616fde974e7a147e",
        },
        {
          id: 'user1',
          name: 'user1',
          displayName: 'Ольга', // pass2
          "passwordHash": "568c31f0f2406ab70255a1d83291220f",
        },
        {
          id: 'user2',
          name: 'user2',
          displayName: 'Пользователь 2',  // пароль21
          "passwordHash": "16be781321794e5459c152834c9e2140",
        },
        {
          id: 'user3',
          name: 'user3',
          displayName: 'Пользователь 3',  // password3
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
