const productService = require('../Service/productService');
const Res = require('../utils/Res');

const createproduct = async (req, res) => {
  try {
    const product = await productService.createproduct(req.body);
    return Res.success(res, 'Product created successfully', product, 201);
  } catch (error) {
    return Res.error(res, 'Failed to create product', error.message, 400);
  }
};

const getproductById = async (req, res) => {
  try {
    const product = await productService.getproductById(req.params.id);
    if (product) return Res.success(res, 'Product found', product);
    else return Res.error(res, 'Product not found', null, 404);
  } catch (error) {
    return Res.error(res, 'Failed to fetch product', error.message, 500);
  }
};

const updateproduct = async (req, res) => {
  try {
    const product = await productService.updateproduct(req.params.id, req.body);
    if (product) return Res.success(res, 'Product updated successfully', product);
    else return Res.error(res, 'Product not found', null, 404);
  } catch (error) {
    return Res.error(res, 'Failed to update product', error.message, 400);
  }
};

const deleteproduct = async (req, res) => {
  try {
    const deleted = await productService.deleteproduct(req.params.id);
    if (deleted) return Res.success(res, 'Product deleted successfully', null, 204);
    else return Res.error(res, 'Product not found', null, 404);
  } catch (error) {
    return Res.error(res, 'Failed to delete product', error.message, 500);
  }
};

const getproductByEmailLetter = async (req, res) => {
  try {
    const products = await productService.getproductsByEmailStart(req.body);
    return Res.success(res, 'Products fetched by email start', products);
  } catch (error) {
    return Res.error(res, 'Failed to fetch products', error.message, 400);
  }
};

const getProducts = async (req, res) => {
  try {
    const result = await productService.getProducts(req.body);
    return Res.success(res, 'All products fetched', result);
  } catch (error) {
    return Res.error(res, 'Failed to fetch products', error.message, 500);
  }
};

const getProductsWithUsers = async (req, res) => {
  try {
    const products = await productService.getProductsWithUsers(req.body);
    return Res.success(res, 'Products with users fetched', products);
  } catch (error) {
    return Res.error(res, 'Failed to fetch products with users', error.message, 400);
  }
};

const getPaginatedProducts = async (req, res) => {
  try {
    const result = await productService.getPaginatedProducts(req.body);

    if (result.rows.length) {
      return Res.success(res, 'Paginated products fetched', {
        products: result.rows,
        total: result.count
      });
    } else {
      return Res.error(res, 'No products found for this page', null, 404);
    }
  } catch (error) {
    return Res.error(res, 'Failed to fetch paginated products', error.message, 500);
  }
};

module.exports = {
  getProductsWithUsers,
  createproduct,
  getproductById,
  updateproduct,
  deleteproduct,
  getproductByEmailLetter,
  getProducts,
  getPaginatedProducts
};
