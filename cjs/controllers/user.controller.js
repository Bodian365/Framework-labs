const userService = require('#services/user.service.js');
const { count } = require('#state/request-counter.js');

const getUsers = async (request, reply) => {
  const { increment } = require('#state/request-counter.js');
  increment();

  const users = await userService.getPublicUsers();
  return { users };
};

const getUserById = async (request, reply) => {
  const { increment } = require('#state/request-counter.js');
  increment();

  const userRepository = require('#repositories/user.repository.js');
  const { id } = request.params;
  const user = await userRepository.findById(id);
  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }
  return { user };
};

module.exports = {
  getUsers,
  getUserById,
};
