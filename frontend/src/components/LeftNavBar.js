import React, { useState } from 'react';
import './LeftNavBar.css';

const LeftNavBar = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'doubts', label: 'Doubts' },
    { id: 'courses', label: 'Courses' },
    { id: 'tests', label: 'Tests' },
    { id: 'activity', label: 'Activity' },
    { id: 'store', label: 'Store' }
  ];

  return (
    <div className="menu">
      <div className="menu-logo">LOGO</div>
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={activeTab === item.id ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab(item.id);
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
};

export default LeftNavBar;