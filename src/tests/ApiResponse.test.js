const ApiResponse = require('../utils/ApiResponse'); // path adjust karein

describe('ApiResponse', () => {
  describe('success', () => {
    it('should return success with default message', () => {
      const res = ApiResponse.success();
      expect(res.success).toBe(true);
      expect(res.description.message).toBe('Success');
    });

    it('should return success with custom data', () => {
      const res = ApiResponse.success({ id: 1 }, 'User Created');
      expect(res.description.id).toBe(1);
      expect(res.description.message).toBe('User Created');
    });
  });

  describe('error', () => {
    it('should return error with default values', () => {
      const res = ApiResponse.error();
      expect(res.success).toBe(false);
      expect(res.description.message).toBe('Something went wrong');
    });

    it('should return error with custom message and code', () => {
      const res = ApiResponse.error('Invalid', 400, { id: 1 });
      expect(res.description.message).toBe('Invalid');
      expect(res.description.data.id).toBe(1);
    });

    it('should return error when data is falsy', () => { // Missing branch cover karega
      const res = ApiResponse.error('No Data', 400, null);
      expect(res.success).toBe(false);
      expect(res.description).not.toHaveProperty('data');
    });
  });
});
