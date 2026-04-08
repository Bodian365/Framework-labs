const getUserByIdSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
    },
    required: ['id'],
  },
};
module.exports = {
  getUserByIdSchema,
};
