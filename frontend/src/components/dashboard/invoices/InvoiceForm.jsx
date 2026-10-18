import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useClients } from '../../../hooks/useClients';
import api from '../../../services/api';
import './invoices.css';

const InvoiceForm = ({ invoice, onClose }) => {
  const [formData, setFormData] = useState({
    client: invoice?.client || '',
    dueDate: invoice?.dueDate || new Date().toISOString().split('T')[0],
    items: invoice?.items || [{ description: '', quantity: 1, price: 0, amount: 0 }],
    subtotal: invoice?.subtotal || 0,
    tax: invoice?.tax || 0,
    discount: invoice?.discount || 0,
    total: invoice?.total || 0,
    notes: invoice?.notes || '',
    status: invoice?.status || 'draft'
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        setClients(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch clients');
      }
    };
    fetchClients();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Recalculate amount
    newItems[index].amount = newItems[index].quantity * newItems[index].price;
    
    setFormData(prev => {
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxAmount = (subtotal * (prev.tax || 0)) / 100;
      const discountAmount = (subtotal * (prev.discount || 0)) / 100;
      const total = subtotal + taxAmount - discountAmount;
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        total
      };
    });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0, amount: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    
    setFormData(prev => {
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxAmount = (subtotal * (prev.tax || 0)) / 100;
      const discountAmount = (subtotal * (prev.discount || 0)) / 100;
      const total = subtotal + taxAmount - discountAmount;
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        total
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (invoice?._id) {
        await api.put(`/invoices/${invoice._id}`, formData);
      } else {
        await api.post('/invoices', formData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          <div className="modal-header">
            <h2>{invoice?._id ? 'Edit Invoice' : 'Create Invoice'}</h2>
            <button className="close-button" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <form className="invoice-form" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Client *</label>
                <select
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} {client.company && `(${client.company})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="items-section">
              <div className="items-section-header">
                <h3>Invoice Items</h3>
                <motion.button 
                  type="button" 
                  className="add-item-button"
                  onClick={handleAddItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiPlus /> Add Item
                </motion.button>
              </div>

              {formData.items.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="item-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <div className="item-amount">
                    ${(item.amount || 0).toFixed(2)}
                  </div>
                  {formData.items.length > 1 && (
                    <motion.button 
                      type="button" 
                      className="remove-item-button"
                      onClick={() => handleRemoveItem(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiMinus />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="totals-section">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${(formData.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <div className="tax-input">
                  <span>Tax:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => {
                      const tax = parseFloat(e.target.value) || 0;
                      const taxAmount = (formData.subtotal * tax) / 100;
                      setFormData({
                        ...formData,
                        tax,
                        total: formData.subtotal + taxAmount - ((formData.subtotal * (formData.discount || 0)) / 100)
                      });
                    }}
                  />
                  <span>%</span>
                </div>
                <span>${((formData.subtotal * (formData.tax || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <div className="discount-input">
                  <span>Discount:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      const discountAmount = (formData.subtotal * discount) / 100;
                      setFormData({
                        ...formData,
                        discount,
                        total: formData.subtotal + ((formData.subtotal * (formData.tax || 0)) / 100) - discountAmount
                      });
                    }}
                  />
                  <span>%</span>
                </div>
                <span>-${((formData.subtotal * (formData.discount || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total:</span>
                <span>${(formData.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or terms..."
              />
            </div>

            <div className="form-actions">
              <motion.button 
                type="button" 
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button 
                type="submit" 
                className="save-button"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" /> Saving...
                  </>
                ) : (
                  'Save Invoice'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InvoiceForm;