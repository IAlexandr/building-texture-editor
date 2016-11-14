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
          displayName: 'Ольга Иванова', // лютик1
          "passwordHash": "d87e30a00de66dec6a089361eda4334c",
        },
        {
          id: 'user2',
          name: 'user2',
          displayName: 'Александра Иванова',  // ромашка2
          "passwordHash": "ae1fd1cd470bc56bcde41c45e55238d7",
        },
        {
          id: 'user3',
          name: 'user3',
          displayName: 'Иван Ефремов',  // кактус3
          "passwordHash": "22d70b02df598b85a47187f90f906c72",
        },
        {
          id: 'user4',
          name: 'user4',
          displayName: 'Андрей Шабалин',  // роза4
          "passwordHash": "3e6258529c24cbcdc0bc34c4f8697825",
        },
        {
          id: 'user5',
          name: 'user5',
          displayName: 'Елена Медведева',  // подсолнух5
          "passwordHash": "eb3b816c7786c7caec955b8daf2ae172",
        },
        {
          id: 'user6',
          name: 'user6',
          displayName: 'Пользователь 6',  // подснежник6
          "passwordHash": "62755f40a89275a82b59c14d1c273fd7",
        },
        {
          id: 'user7',
          name: 'user7',
          displayName: 'Пользователь 7',  // астра7
          "passwordHash": "6293c52e5b223f40ff31a16792597dca",
        },
        {
          id: 'user8',
          name: 'user8',
          displayName: 'Пользователь 8',  // N5STuQ
          "passwordHash": "0d77248c6b80cf882b34a5bfbd9002a6",
        },
        {
          id: 'user9',
          name: 'user9',
          displayName: 'Пользователь 9',  // FhGpFe
          "passwordHash": "b5c0286aecf26a6e3fe82daea796340a",
        },
        {
          id: 'user10',
          name: 'user10',
          displayName: 'Пользователь 10',  // MLgXPe
          "passwordHash": "4fe988821814afa0983b21a8e7650b6f",
        },
        {
          id: 'user11',
          name: 'user11',
          displayName: 'Пользователь 11',  // M3xe6w
          "passwordHash": "df103c1f9de1b42524c5dc1597e5a296",
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
          userIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11']
        }
      ]);
    },
  };
}
