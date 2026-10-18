import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { FiUsers, FiFileText, FiHome, FiLogOut, FiPlus, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ClientList from './clients/ClientList';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import InvoiceList from './invoices/InvoiceList';
import PaperStack from '../shared/PaperStack';
import './dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { clientCount, totalRevenue, invoiceCount, isLoading, error } = useDashboardStats();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredTab, setHoveredTab] = useState(null);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="dashboard-container">
      <PaperStack />
      
      {/* App Header */}
      <header className="app-header">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="app-brand"
        >
          <span className="invoice-text">Invoice</span>
          <span className="pro-text">Pro</span>
        </motion.div>
        
        <div className="header-right">
          <motion.p 
            className="welcome-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome, <span className="user-name">{user?.name}</span>
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#6d28d9' }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="logout-button"
          >
            <FiLogOut /> Logout
          </motion.button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-tabs">
        {[
          { id: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
          { id: 'clients', icon: <FiUsers />, label: 'Clients' },
          { id: 'invoices', icon: <FiFileText />, label: 'Invoices' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onHoverStart={() => setHoveredTab(tab.id)}
            onHoverEnd={() => setHoveredTab(null)}
            whileHover={{ y: -3 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {hoveredTab === tab.id && (
              <motion.span 
                className="tab-highlight"
                layoutId="tabHighlight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span>!</span>
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Stats Grid */}
              <div className="stats-grid">
                <motion.div 
                  className="stat-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5 }}
                >
                  <div className="stat-icon clients">
                    <FiUsers size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Total Clients</h3>
                    {isLoading ? (
                      <div className="loading-spinner" />
                    ) : (
                      <p className="stat-value">{clientCount}</p>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  className="stat-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="stat-icon revenue">
                    <FiDollarSign size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Total Revenue</h3>
                    {isLoading ? (
                      <div className="loading-spinner" />
                    ) : (
                      <p className="stat-value">${totalRevenue?.toLocaleString() || '0'}</p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity Section */}
              <motion.div 
                className="recent-activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-list">
                  {/* Sample activity items - replace with real data */}
                  <motion.div 
                    className="activity-item"
                    whileHover={{ x: 5 }}
                  >
                    <div className="activity-icon paid"></div>
                    <div className="activity-details">
                      <p>Invoice #INV-2023-001 marked as Paid</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="activity-item"
                    whileHover={{ x: 5 }}
                  >
                    <div className="activity-icon new"></div>
                    <div className="activity-details">
                      <p>New client "Acme Corp" added</p>
                      <span className="activity-time">1 day ago</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ClientList />
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <InvoiceList />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Motivation Widget */}
      <motion.div 
        className="motivation-widget"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
      </motion.div>
    </div>
  );
};

export default Dashboard;