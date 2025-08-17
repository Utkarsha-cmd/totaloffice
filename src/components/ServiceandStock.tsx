import React, { useState, useEffect } from 'react';
import { serviceApi } from '../services/api';
import { toast } from 'react-toastify';
import { Edit3, Trash2 } from 'lucide-react';

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
  stock: number | string;
  price: number | string;
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
    { name: '', stock: '', price: '' }
  ]);
  const [productsToAdd, setProductsToAdd] = useState<NewProduct[]>([
    { name: '', stock: '', price: '' }
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

    const validProducts = newProducts.filter(p => p.name.trim()).map(p => ({
      name: p.name,
      stock: typeof p.stock === 'string' ? (parseInt(p.stock) || 0) : p.stock,
      price: typeof p.price === 'string' ? (parseFloat(p.price) || 0) : p.price
    }));
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
      setNewProducts([{ name: '', stock: '', price: '' }]);
      toast.success('Service created successfully');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleAddProductsToService = async (serviceId: string) => {
    const validProducts = productsToAdd.filter(p => p.name.trim()).map(p => ({
      name: p.name,
      stock: typeof p.stock === 'string' ? (parseInt(p.stock) || 0) : p.stock,
      price: typeof p.price === 'string' ? (parseFloat(p.price) || 0) : p.price
    }));
    if (validProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      // Get the updated service with all products from the backend
      const updatedService = await serviceApi.addProductsToService(serviceId, validProducts);

      // Update the services state by replacing the entire service with the updated one
      setServices(prevServices =>
        prevServices.map(service =>
          service._id === serviceId ? updatedService : service
        )
      );

      setShowAddProductModal(null);
      setProductsToAdd([{ name: '', stock: '', price: '' }]);
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
    <div className="flex justify-end items-center mb-4">
      <button
        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 shadow-sm"
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
            <h3 className="text-lg font-semibold text-emerald-700">{service.serviceName}</h3>
            <button
              onClick={() => {
                setShowAddProductModal(service._id);
                setProductsToAdd([{ name: '', stock: 0, price: 0 }]);
              }}
              className="text-xs px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm"
            >
              + Add Products
            </button>
          </div>
          <div className="space-y-4">
            {service.products.map((product) =>
              editingProductId === product._id ? (
                <div key={product._id} className="w-full border-b border-gray-200 pb-3">
                  <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                  <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-end">
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
                        className="border px-2 py-1 rounded border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm w-full sm:w-24 text-gray-900 font-medium"
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
                        className="border px-2 py-1 rounded border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm w-full sm:w-24 text-gray-900 font-medium"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleSaveEdit(product._id, service._id)
                        }
                        className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProductId(null)}
                        className="text-sm border border-gray-300 px-3 py-1 rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={product._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-3">{product.name}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">
                        Stock: {product.stock}
                      </span>
                      <span className="font-semibold text-gray-900">
                        £{product.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProductId(product._id);
                        setEditedProduct({ ...product });
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-md transition-colors focus:outline-none focus:ring-0"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ecfdf5';
                        e.currentTarget.style.color = '#047857';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#059669';
                      }}
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(service._id, product._id)}
                      className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors focus:outline-none focus:ring-0"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.color = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#dc2626';
                      }}
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Service Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded px-3 py-2 text-gray-700 outline-none"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
          />
        </div>

        <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
          {newProducts.map((product, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => {
                    const updated = [...newProducts];
                    updated[index].name = e.target.value;
                    setNewProducts(updated);
                  }}
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded px-3 py-2 text-gray-700 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Stock</label>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => {
                    const updated = [...newProducts];
                    updated[index].stock = e.target.value === '' ? '' : parseInt(e.target.value) || 0;
                    setNewProducts(updated);
                  }}
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded px-3 py-2 text-gray-700 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => {
                    const updated = [...newProducts];
                    updated[index].price = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                    setNewProducts(updated);
                  }}
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded px-3 py-2 text-gray-700 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            className="text-sm text-emerald-600 hover:underline"
            onClick={() =>
              setNewProducts([...newProducts, { name: '', stock: '', price: '' }])
            }
          >
            + Add Another Product
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowAddModal(false)}
            className="text-sm border border-gray-300 px-3 py-1 rounded text-gray-700 
             hover:bg-gray-100 outline-none focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleAddService}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm"
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
            <div key={index} className="grid grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => {
                    const updated = [...productsToAdd];
                    updated[index].name = e.target.value;
                    setProductsToAdd(updated);
                  }}
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded px-3 py-2 text-gray-700 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Stock</label>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => {
                    const updated = [...productsToAdd];
                    updated[index].stock = e.target.value === '' ? '' : parseInt(e.target.value) || 0;
                    setProductsToAdd(updated);
                  }}
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded px-3 py-2 text-gray-700 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => {
                    const updated = [...productsToAdd];
                    updated[index].price = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                    setProductsToAdd(updated);
                  }}
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded px-3 py-2 text-gray-700 outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            className="text-sm text-emerald-600 hover:underline"
            onClick={() =>
              setProductsToAdd([...productsToAdd, { name: '', stock: '', price: '' }])
            }
          >
            + Add Another Product
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowAddProductModal(null)}
            className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddProductsToService(showAddProductModal)}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm"
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
