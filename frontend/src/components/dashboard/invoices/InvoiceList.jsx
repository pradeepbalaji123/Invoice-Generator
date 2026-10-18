import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoices } from '../../../hooks/useInvoices';
import { FiFileText, FiPlus, FiChevronDown, FiSearch, FiDownload, FiSend, FiEdit, FiTrash2 } from 'react-icons/fi';
import InvoiceForm from './InvoiceForm';
import api from '../../../services/api';
import './invoices.css';

const InvoiceList = () => {
  const { invoices, loading, error, fetchInvoices } = useInvoices();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [sendLoading, setSendLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Process invoices to handle deleted clients
  const processedInvoices = invoices.map(invoice => ({
    ...invoice,
    client: invoice.client || { 
      name: 'Deleted Client', 
      _id: null,
      isDeleted: true 
    }
  }));

  const filteredInvoices = processedInvoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.client.name.toLowerCase().includes(searchLower) ||
      (invoice.client.isDeleted && 'deleted client'.includes(searchLower)) ||
      invoice.status.toLowerCase().includes(searchLower)
    );
  });

  const handleDownload = async (id) => {
    try {
      setDownloadLoading(id);
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert(error.response?.data?.message || 'Failed to download invoice');
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleSend = async (id) => {
    try {
      setSendLoading(id);
      await api.post(`/invoices/${id}/send`);
      alert('Invoice sent successfully!');
      fetchInvoices();
    } catch (error) {
      console.error('Send failed:', error);
      alert(error.response?.data?.message || 'Failed to send invoice');
    } finally {
      setSendLoading(null);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      setStatusUpdates(prev => ({ ...prev, [invoiceId]: true }));
      await api.put(`/invoices/${invoiceId}`, { status: newStatus });
      fetchInvoices();
    } catch (error) {
      console.error('Status update failed:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdates(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleteLoading(id);
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error.response?.data?.message || 'Failed to delete invoice');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="invoice-dashboard">
      {/* Header Section */}
      <motion.div 
        className="invoice-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-left">
          <h1>Invoice Management</h1>
          <p className="subtitle">Track and manage your invoices</p>
        </div>
        
        <div className="header-controls">
          <motion.div 
            className="search-bar"
            whileHover={{ boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2)' }}
          >
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="add-button"
            onClick={() => {
              setCurrentInvoice(null);
              setIsFormOpen(true);
            }}
          >
            <FiPlus /> New Invoice
          </motion.button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="invoice-content">
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Error loading invoices: {error}
          </motion.div>
        )}

        {loading && !invoices.length ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading your invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src="/illustrations/no-invoices.svg" alt="No invoices" />
            <h3>{searchTerm ? 'No matching invoices found' : 'No invoices yet'}</h3>
            <p>
              {searchTerm 
                ? 'Try a different search term' 
                : 'Create your first invoice to get started'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cta-button"
              onClick={() => setIsFormOpen(true)}
            >
              <FiPlus /> Create Invoice
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="invoice-table-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredInvoices.map(invoice => (
                    <motion.tr 
                      key={invoice._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                    >
                      <td>{invoice.invoiceNumber}</td>
                      <td>
                        <div className="client-cell">
                          {invoice.client.isDeleted ? (
                            <span className="deleted-client">
                              {invoice.client.name}
                              <span className="deleted-tooltip">Client deleted</span>
                            </span>
                          ) : (
                            invoice.client.name
                          )}
                        </div>
                      </td>
                      <td>{new Date(invoice.date).toLocaleDateString()}</td>
                      <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td>${invoice.total?.toFixed(2) || '0.00'}</td>
                      <td>
                        <div className="status-dropdown">
                          <select
                            value={invoice.status}
                            onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                            disabled={statusUpdates[invoice._id] || invoice.client.isDeleted}
                            className={`status-select status-${invoice.status}`}
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                          </select>
                          <FiChevronDown className="dropdown-icon" />
                          {statusUpdates[invoice._id] && (
                            <span className="status-updating">Updating...</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <motion.button 
                            className="action-button"
                            onClick={() => {
                              setCurrentInvoice(invoice);
                              setIsFormOpen(true);
                            }}
                            title="Edit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiEdit />
                          </motion.button>
                          <motion.button 
                            className="action-button primary"
                            onClick={() => handleDownload(invoice._id)}
                            disabled={downloadLoading === invoice._id}
                            title="Download PDF"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {downloadLoading === invoice._id ? (
                              <div className="spinner" />
                            ) : (
                              <FiDownload />
                            )}
                          </motion.button>
                          <motion.button 
                            className="action-button success"
                            onClick={() => handleSend(invoice._id)}
                            disabled={sendLoading === invoice._id || invoice.status !== 'draft' || invoice.client.isDeleted}
                            title={invoice.client.isDeleted ? "Cannot send - client deleted" : "Send to Client"}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {sendLoading === invoice._id ? (
                              <div className="spinner" />
                            ) : (
                              <FiSend />
                            )}
                          </motion.button>
                          <motion.button 
                            className="action-button danger"
                            onClick={() => handleDelete(invoice._id)}
                            disabled={deleteLoading === invoice._id}
                            title="Delete Invoice"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {deleteLoading === invoice._id ? (
                              <div className="spinner" />
                            ) : (
                              <FiTrash2 />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Invoice Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <InvoiceForm
            invoice={currentInvoice}
            onClose={() => {
              setIsFormOpen(false);
              fetchInvoices();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceList;