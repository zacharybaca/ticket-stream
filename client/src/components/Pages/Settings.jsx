import NotificationCenter from '../Notifications/NotificationCenter.jsx';
import './incidents.css';

const Settings = () => {
  return (
    <div className="incidents-layout">
      <div className="incidents-header">
        <div>
          <h1>Settings</h1>
          <p className="muted-text">Manage account preferences and notification acknowledgements.</p>
        </div>
      </div>

      <NotificationCenter />
    </div>
  );
};

export default Settings;
