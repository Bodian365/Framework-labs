module.exports = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[0-9]+$' },
    search: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
};
