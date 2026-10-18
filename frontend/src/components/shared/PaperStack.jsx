// src/components/shared/PaperStack.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PaperStackContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
`;

const Paper = styled(motion.div)`
  position: absolute;
  background: white;
  border-radius: 2px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  opacity: 0.7;
`;

const PaperStack = () => {
  const papers = [
    { size: '200px', x: '10%', y: '20%', rotate: -5 },
    { size: '180px', x: '80%', y: '30%', rotate: 3 },
    { size: '220px', x: '30%', y: '60%', rotate: 2 },
    { size: '150px', x: '70%', y: '70%', rotate: -3 },
  ];

  return (
    <PaperStackContainer>
      {papers.map((paper, index) => (
        <Paper
          key={index}
          initial={{ 
            y: -100,
            opacity: 0,
            rotate: paper.rotate - 10
          }}
          animate={{ 
            y: 0,
            opacity: 0.7,
            rotate: paper.rotate
          }}
          transition={{
            duration: 1.5,
            delay: index * 0.3,
            type: 'spring'
          }}
          style={{
            width: paper.size,
            height: paper.size,
            left: paper.x,
            top: paper.y,
            transform: `rotate(${paper.rotate}deg)`
          }}
        />
      ))}
    </PaperStackContainer>
  );
};

export default PaperStack;