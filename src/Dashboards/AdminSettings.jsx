import React, { useState } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from './AdminLayout'
import './AdminSettings.css'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'MERKO Platform',
    siteDescription: 'B2B E-commerce Platform',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoApproval: false,
    sessionTimeout: 30,
    maxFileSize: 5,
    allowedFileTypes: 'jpg,png,pdf,doc,docx',
    backupFrequency: 'daily'
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', settings)
    alert('Settings saved successfully!')
  }

  return (
    <AdminLayout activeTab="settings">
      <motion.div 
        className="admin-settings-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
            <div className="page-header">
              <h1>System Settings</h1>
              <p>Configure platform settings and preferences</p>
            </div>

            <div className="settings-grid">
              {/* General Settings */}
              <motion.div 
                className="settings-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3>General Settings</h3>
                
                <div className="setting-item">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </div>

                <div className="setting-item">
                  <label>Site Description</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  />
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    />
                    Maintenance Mode
                  </label>
                </div>
              </motion.div>

              {/* Notification Settings */}
              <motion.div 
                className="settings-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Notifications</h3>
                
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                    Email Notifications
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                    SMS Notifications
                  </label>
                </div>
              </motion.div>

              {/* Security Settings */}
              <motion.div 
                className="settings-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3>Security & Access</h3>
                
                <div className="setting-item">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="120"
                  />
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.autoApproval}
                      onChange={(e) => handleSettingChange('autoApproval', e.target.checked)}
                    />
                    Auto-approve new users
                  </label>
                </div>
              </motion.div>

              {/* File Upload Settings */}
              <motion.div 
                className="settings-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3>File Upload</h3>
                
                <div className="setting-item">
                  <label>Max File Size (MB)</label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="50"
                  />
                </div>

                <div className="setting-item">
                  <label>Allowed File Types</label>
                  <input
                    type="text"
                    value={settings.allowedFileTypes}
                    onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                    placeholder="jpg,png,pdf,doc,docx"
                  />
                </div>
              </motion.div>

              {/* Backup Settings */}
              <motion.div 
                className="settings-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3>Backup & Maintenance</h3>
                
                <div className="setting-item">
                  <label>Backup Frequency</label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="setting-actions">
                  <button className="backup-btn">Create Backup Now</button>
                  <button className="restore-btn">Restore from Backup</button>
                </div>
              </motion.div>
            </div>

            <div className="save-section">
              <button className="save-settings-btn" onClick={handleSaveSettings}>
                Save Settings
              </button>
            </div>
      </motion.div>
    </AdminLayout>
  )
}

export default AdminSettings