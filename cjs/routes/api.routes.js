const userController = require('#controllers/user.controller.js');
const { getStats } = require('#state/request-counter.js');

const { getUserByIdSchema } = require('#validators/user.validators.js');

async function apiRoutes(fastify, options) {
  fastify.get('/users', userController.getUsers);
  fastify.get('/users/:id', getUserByIdSchema, userController.getUserById);

  fastify.get('/stats', async () => getStats());
}

module.exports = apiRoutes;
