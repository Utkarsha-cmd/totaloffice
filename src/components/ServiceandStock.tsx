import React, { useState, useEffect } from 'react';
import { serviceApi } from '../services/api';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  stock: number;
  price: number;
}

interface Service {
  _id: string;
  serviceName: string;
  products: Product[];
}

interface NewProduct {
  name: string;
  stock: number;
  price: number;
}

const ServicesAndStocks = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({ 
    name: '', 
    stock: 0, 
    price: 0 
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newProducts, setNewProducts] = useState<NewProduct[]>([
    { name: '', stock: 0, price: 0 }
  ]);
  const [productsToAdd, setProductsToAdd] = useState<NewProduct[]>([
    { name: '', stock: 0, price: 0 }
  ]);

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await serviceApi.getServices();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSaveEdit = async (productId: string, serviceId: string) => {
    try {
      await serviceApi.updateProduct(productId, {
        name: editedProduct.name,
        stock: editedProduct.stock,
        price: editedProduct.price
      });
      
      // Update local state
      setServices(prevServices => 
        prevServices.map(service => {
          if (service._id !== serviceId) return service;
          const updatedProducts = service.products.map(p => 
            p._id === productId ? { ...p, ...editedProduct } : p
          );
          return { ...service, products: updatedProducts };
        })
      );
      
      setEditingProductId(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      toast.error('Please enter a service name');
      return;
    }

    const validProducts = newProducts.filter(p => p.name.trim());
    if (validProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      const newService = await serviceApi.createService({
        serviceName: newServiceName,
        products: validProducts
      });

      setServices(prev => [...prev, newService]);
      setShowAddModal(false);
      setNewServiceName('');
      setNewProducts([{ name: '', stock: 0, price: 0 }]);
      toast.success('Service created successfully');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleAddProductsToService = async (serviceId: string) => {
    const validProducts = productsToAdd.filter(p => p.name.trim());
    if (validProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      const updatedService = await serviceApi.addProductsToService(serviceId, validProducts);
      
      setServices(prevServices => 
        prevServices.map(s => 
          s._id === serviceId 
            ? { ...s, products: [...s.products, ...updatedService.products] } 
            : s
        )
      );
      
      setShowAddProductModal(null);
      setProductsToAdd([{ name: '', stock: 0, price: 0 }]);
      toast.success('Products added successfully');
    } catch (error) {
      console.error('Error adding products:', error);
      toast.error('Failed to add products');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service and all its products?')) {
      try {
        await serviceApi.deleteService(serviceId);
        setServices(prev => prev.filter(s => s._id !== serviceId));
        toast.success('Service deleted successfully');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const handleDeleteProduct = async (serviceId: string, productId: string) => {
    try {
      await serviceApi.deleteProduct(serviceId, productId);
      
      // Update the UI to remove the deleted product
      setServices(prevServices => 
        prevServices.map(service => {
          if (service._id === serviceId) {
            return {
              ...service,
              products: service.products.filter(p => p._id !== productId)
            };
          }
          return service;
        })
      );
      
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Services and Stocks</h2>
          <button
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
            onClick={() => {
              setNewServiceName('');
              setNewProducts([{ name: '', stock: 0, price: 0 }]);
              setShowAddModal(true);
            }}
          >
            + Add Service / Product
          </button>
        </div>

        {services.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {isLoading ? 'Loading services...' : 'No services yet. Click "Add Service / Product" to create one.'}
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-green-700">{service.serviceName}</h3>
                <button
                  onClick={() => {
                    setShowAddProductModal(service._id);
                    setProductsToAdd([{ name: '', stock: 0, price: 0 }]);
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  + Add Products
                </button>
              </div>
              <div className="space-y-4">
                {service.products.map((product) =>
                  editingProductId === product._id ? (
                    <div key={product._id} className="w-full border-b pb-3">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div>
                          <label className="text-xs text-gray-600 block">Stock</label>
                          <input
                            type="number"
                            value={editedProduct.stock}
                            onChange={(e) =>
                              setEditedProduct({
                                ...editedProduct,
                                stock: parseInt(e.target.value),
                              })
                            }
                            className="border px-2 py-1 rounded text-sm w-full sm:w-24 text-gray-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block">Price (£)</label>
                          <input
                            type="number"
                            value={editedProduct.price}
                            onChange={(e) =>
                              setEditedProduct({
                                ...editedProduct,
                                price: parseFloat(e.target.value),
                              })
                            }
                            className="border px-2 py-1 rounded text-sm w-full sm:w-24 text-gray-900 font-medium"
                          />
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-6">
                          <button
                            onClick={() =>
                              handleSaveEdit(product._id, service._id)
                            }
                            className="text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProductId(null)}
                            className="text-sm text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={product._id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock}, Price: £{product.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProductId(product._id);
                            setEditedProduct({ ...product });
                          }}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDeleteProduct(service._id, product._id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Service/Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Service & Products</h3>

            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Service Name</span>
              <input
                type="text"
                className="mt-1 block w-full border rounded px-3 py-2 text-gray-700"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
            </label>

            <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
              {newProducts.map((product, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="block text-sm text-gray-600">Product Name</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => {
                        const updated = [...newProducts];
                        updated[index].name = e.target.value;
                        setNewProducts(updated);
                      }}
                      className="w-full border px-2 py-1 rounded text-gray-700 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Stock</label>
                    <input
                      type="text"
                      inputMode='numeric'
                      pattern="[0-9]*"
                      value={product.stock}
                      onChange={(e) => {
                        const updated = [...newProducts];
                        updated[index].stock = parseInt(e.target.value) || 0;
                        setNewProducts(updated);
                      }}
                      className="w-full border px-2 py-1 rounded text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Price (£)</label>
                    <input
                      type="text"
                      step ="0.01"
                      value={product.price}
                      onChange={(e) => {
                        const updated = [...newProducts];
                        updated[index].price = parseFloat(e.target.value) || 0;
                        setNewProducts(updated);
                      }}
                      className="w-full border px-2 py-1 rounded text-gray-700 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() =>
                  setNewProducts([...newProducts, { name: '', stock: 0, price: 0 }])
                }
              >
                + Add Another Product
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Products to Service Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Products to Service</h3>

            <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
              {productsToAdd.map((product, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="block text-sm text-gray-600">Product Name</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => {
                        const updated = [...productsToAdd];
                        updated[index].name = e.target.value;
                        setProductsToAdd(updated);
                      }}
                      className="w-full border px-2 py-1 rounded text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Stock</label>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => {
                        const updated = [...productsToAdd];
                        updated[index].stock = parseInt(e.target.value) || 0;
                        setProductsToAdd(updated);
                      }}
                      className="w-full border px-2 py-1 rounded text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => {
                        const updated = [...productsToAdd];
                        updated[index].price = parseFloat(e.target.value) || 0;
                        setProductsToAdd(updated);
                      }}
                      className="w-full border px-2 py-1 rounded text-gray-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() =>
                  setProductsToAdd([...productsToAdd, { name: '', stock: 0, price: 0 }])
                }
              >
                + Add Another Product
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddProductModal(null)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddProductsToService(showAddProductModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServicesAndStocks;
