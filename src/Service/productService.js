// const userRepository = require('../Repository/userRepository');

// const getUsersByEmailStart = async (req) => {

//     // const { letter } = req;
//     // if (!letter || letter.length !== 1) {
//     //     throw new Error('Invalid letter input');
//     // }

//     return await userRepository.searchUsers(req);
// };

// module.exports = {
//     getUsersByEmailStart,
// };


// services/userService.js
const productRepo = require('../repository/productRepository');

const createproduct = async (data) => {
  return await productRepo.createproduct(data);
};

const getproductById = async (id) => {
  return await productRepo.getproductById(id);
};

const updateproduct= async (id, data) => {
  return await productRepo.updateproduct(id, data);
};

const deleteproduct = async (id) => {
  return await productRepo.softDeleteproduct(id);
};

const getproductByEmailStart = async ({ search }) => {
  return await productRepo.filterproductByEmail(search);
};

const filterproductByEmailIn = async ({ search }) => {
  return await productRepo.filterproductByEmailIn(search);
};
// const getProducts = async (req) => {
//   return await productRepo.getProducts(req);
// };
const getProductsWithUsers = async ({ data }) => {
  return await productRepo.getProductsWithUsers(data);
};



const getProducts = async ({filter,sort,page}) => {
  console.log(page)
  return await productRepo.getProducts({filter,sort,page}); 
};

const getPaginatedProducts = async (paginationParams) => {
  //const { limit = 10, offset = 0 } = paginationParams;
  return await productRepo.findPaginatedProducts(paginationParams);
};


module.exports = {
  createproduct,
  getproductById,
  updateproduct,
  getProductsWithUsers,
  deleteproduct,
  getproductByEmailStart,
  filterproductByEmailIn,
  getProducts,
  getPaginatedProducts
};
