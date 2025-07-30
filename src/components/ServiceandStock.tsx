import React, { useState } from 'react';


const ServicesAndStocks = () => {
  const [servicesAndProducts, setServicesAndProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({ id: '', name: '', stock: 0, price: 0 });

  const [showAddModal, setShowAddModal] = useState(false);

  const [newServiceName, setNewServiceName] = useState('');
  const [newProducts, setNewProducts] = useState([{ name: '', stock: 0, price: 0 }]);

  const handleSaveEdit = (productId, serviceName) => {
    const updatedServices = servicesAndProducts.map(service => {
      if (service.serviceName !== serviceName) return service;
      const updatedProducts = service.products.map(p =>
        p.id === productId ? { ...p, ...editedProduct } : p
      );
      return { ...service, products: updatedProducts };
    });
    setServicesAndProducts(updatedServices);
    setEditingProductId(null);
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;

    const productsWithIds = newProducts
      .filter((p) => p.name.trim())
      .map((p, i) => ({
        ...p,
        id: `${newServiceName}-${i}-${Date.now()}`
      }));

    const newService = {
      serviceName: newServiceName,
      products: productsWithIds,
    };

    setServicesAndProducts([...servicesAndProducts, newService]);
    setShowAddModal(false);
    setNewServiceName('');
    setNewProducts([{ name: '', stock: 0, price: 0 }]);
  };

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

        {servicesAndProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No services yet. Click “Add Service / Product” to create one.
          </div>
        ) : (
          servicesAndProducts.map((service) => (
            <div
              key={service.serviceName}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <h3 className="text-lg font-semibold text-green-700 mb-3">{service.serviceName}</h3>
              <div className="space-y-4">
                {service.products.map((product) =>
                  editingProductId === product.id ? (
                    <div key={product.id} className="w-full border-b pb-3">
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
                              handleSaveEdit(product.id, service.serviceName)
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
                    <div key={product.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock}, Price: £{product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProductId(product.id);
                          setEditedProduct(product);
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
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
    </>
  );
};

export default ServicesAndStocks;
