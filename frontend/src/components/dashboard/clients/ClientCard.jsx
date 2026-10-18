import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const ClientCard = ({ client, onEdit, onDelete }) => {
  return (
    <motion.div 
      className="client-card"
      whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
    >
      <div className="card-header">
        <div className="client-avatar">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="client-info">
          <h3>{client.name}</h3>
          {client.company && (
            <p className="company">{client.company}</p>
          )}
        </div>
      </div>
      
      <div className="card-body">
        <div className="contact-item">
          <FiMail className="contact-icon" />
          <a href={`mailto:${client.email}`}>{client.email}</a>
        </div>
        
        <div className="contact-item">
          <FiMapPin className="contact-icon" />
          <p>{client.address}</p>
        </div>
        
        {client.phone && (
          <div className="contact-item">
            <FiPhone className="contact-icon" />
            <a href={`tel:${client.phone}`}>{client.phone}</a>
          </div>
        )}
      </div>
      
      <div className="card-actions">
        <motion.button 
          onClick={() => onEdit(client)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="edit-button"
        >
          <FiEdit2 />
        </motion.button>
        <motion.button 
          onClick={() => onDelete(client._id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="delete-button"
        >
          <FiTrash2 />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ClientCard;