import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClients } from '../../../hooks/useClients';
import ClientCard from './ClientCard';
import ClientForm from './ClientForm';
import { FiPlus, FiSearch, FiX, FiUserPlus } from 'react-icons/fi';
import './clients.css';

const ClientList = () => {
  const { clients, loading, error, fetchClients, deleteClient } = useClients();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients().catch(err => console.error('Fetch error:', err));
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="client-dashboard">
      {/* Header Section */}
      <motion.div 
        className="client-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-left">
          <h1>Client Management</h1>
          <p className="subtitle">Manage your client relationships</p>
        </div>
        
        <div className="header-controls">
          <motion.div 
            className="search-bar"
            whileHover={{ boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2)' }}
          >
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="add-client-button"
            onClick={() => setIsFormOpen(true)}
          >
            <FiUserPlus /> New Client
          </motion.button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="client-content">
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Error loading clients: {error.message}
          </motion.div>
        )}

        {loading && !clients.length ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading your clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src="/illustrations/no-clients.svg" alt="No clients" />
            <h3>{searchTerm ? 'No matching clients found' : 'No clients yet'}</h3>
            <p>
              {searchTerm 
                ? 'Try a different search term' 
                : 'Add your first client to get started'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cta-button"
              onClick={() => setIsFormOpen(true)}
            >
              <FiPlus /> Add Client
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="client-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <AnimatePresence>
              {filteredClients.map(client => (
                <motion.div
                  key={client._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25 }}
                  whileHover={{ y: -5 }}
                >
                  <ClientCard
                    client={client}
                    onEdit={() => {
                      setEditingClient(client);
                      setIsFormOpen(true);
                    }}
                    onDelete={deleteClient}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Client Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ClientForm
            client={editingClient}
            onClose={() => {
              setIsFormOpen(false);
              setEditingClient(null);
            }}
            onSuccess={() => {
              fetchClients();
              setIsFormOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientList;