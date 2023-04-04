const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required',
    };
  }
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  if (existingUser) {
    return {
      error: 'Username is in use',
    };
  }

  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return { user: user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => {
    if (user.id === id) {
      return user;
    }
  });
  return user;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const roomUsers = users.filter((user) => {
    return user.room === room;
  });

  return roomUsers;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
