import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiHome, FiBriefcase, FiPhone, FiUserPlus } from 'react-icons/fi';
import { useClients } from '../../../hooks/useClients';
import './clients.css';

const ClientForm = ({ client, onClose, onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    address: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createClient, updateClient } = useClients();

  // Initialize form when editing
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        company: client.company || '',
        address: client.address || '',
        phone: client.phone || ''
      });
    }
  }, [client]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (client) {
        await updateClient(client._id, formData);
      } else {
        await createClient(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving client:', error);
      setErrors({ submit: error.message || 'Failed to save client' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>
              {client ? (
                <>
                  <FiUser /> Edit Client
                </>
              ) : (
                <>
                  <FiUserPlus /> New Client
                </>
              )}
            </h2>
            <motion.button 
              className="close-button"
              onClick={onClose}
              whileHover={{ rotate: 90 }}
              disabled={isSubmitting}
            >
              <FiX />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FiUser /> Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error-input' : ''}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                <FiMail /> Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error-input' : ''}
                placeholder="client@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>
                <FiBriefcase /> Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Corp"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>
                <FiHome /> Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={errors.address ? 'error-input' : ''}
                placeholder="123 Main St, City"
                disabled={isSubmitting}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>
                <FiPhone /> Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
              />
            </div>

            {errors.submit && (
              <div className="form-error">
                {errors.submit}
              </div>
            )}

            <div className="form-actions">
              <motion.button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isSubmitting}
                whileHover={{ x: -2 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="save-button"
                disabled={isSubmitting}
                whileHover={{ x: 2 }}
              >
                {isSubmitting ? (
                  <span className="spinner" />
                ) : client ? (
                  'Update Client'
                ) : (
                  'Create Client'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientForm;