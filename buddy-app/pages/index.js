//pages/index.js

{
  /* The following line can be included in your src/index.js or App.js file */
}
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Home.module.css';

import { Tabs, Tab, } from 'react-bootstrap';
import {FaComments, FaCalendarAlt } from 'react-icons/fa'; //For Icons
import { useState } from 'react';
import Events from './events';
import Chats from './chats';

export default function Home({ user }) {

  // State to handle the active tabs
  const [ activeTab, setActiveTab ] = useState('chats');
  
  // Function to handle the tab selecton
  const handleTabSelect = (key) => {
    setActiveTab(key);
  }

  return (
    <>
      {user && <h5>Welcome {user.attributes?.email || user.username}</h5>}
      <br /> <br />
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabSelect}
        id="justify-tab-example"
        className={`mb-3 ${styles.navTabs}`}
        justify
      >
        <Tab
          eventKey="chats"
          title={
            <div className={styles.iconTextContainer}>
              <FaComments className={styles.iconSize} />
              <span className={styles.iconText}>Chats</span>
            </div>
          }
          tabClassName={styles.navLink}
        >
          <br />
          <Chats user={user} />
        </Tab>
        <Tab
          eventKey="events"
          title={
            <div className={styles.iconTextContainer}>
              <FaCalendarAlt className={styles.iconSize} />
              <span className={styles.iconText}>Events</span>
            </div>
          }
          tabClassName={styles.navLink}
        >
          <br />
          {activeTab === 'events' && <Events user={user} />}
        </Tab>
      </Tabs>
    </>
  );
}
