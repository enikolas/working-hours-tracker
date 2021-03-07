module.exports = {
  default: {
    get: jest.fn().mockResolvedValue(),
    post: jest.fn().mockResolvedValue(),
  },
};
