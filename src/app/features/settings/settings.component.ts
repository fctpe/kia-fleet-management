import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  profileImage?: string;
}

interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  safetyIncidents: boolean;
  maintenanceReminders: boolean;
  lowBattery: boolean;
  geofenceViolations: boolean;
  reportGeneration: boolean;
}

interface SystemPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  temperatureUnit: string;
  distanceUnit: string;
  currency: string;
  autoLogout: number;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  apiAccessEnabled: boolean;
  auditLogging: boolean;
  ipRestrictions: boolean;
  allowedIPs: string[];
}

interface FleetConfiguration {
  defaultMapView: string;
  trackingInterval: number;
  geofenceBuffer: number;
  maxIdleTime: number;
  speedThresholds: {
    warning: number;
    critical: number;
  };
  batteryThresholds: {
    low: number;
    critical: number;
  };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <!-- Header Section -->
      <div class="settings-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Settings</h1>
            <p class="settings-subtitle">Manage your fleet management system preferences and configurations</p>
          </div>
          
          <!-- Quick Actions -->
          <div class="quick-actions-header">
            <button class="btn btn--secondary" (click)="exportSettings()">
              <i class="pi pi-download"></i>
              Export Settings
            </button>
            <button class="btn btn--tertiary" (click)="resetToDefaults()">
              <i class="pi pi-refresh"></i>
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Navigation -->
      <div class="settings-nav">
        <div class="nav-tabs">
          <button 
            *ngFor="let category of settingsCategories" 
            class="nav-tab"
            [class.active]="selectedCategory === category.id"
            (click)="selectCategory(category.id)"
          >
            <i class="pi" [class]="category.icon"></i>
            <span>{{ category.name }}</span>
          </button>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="settings-content">
        <!-- User Profile Settings -->
        <div class="settings-section" *ngIf="selectedCategory === 'profile'">
          <div class="section-header">
            <h2>User Profile</h2>
            <p>Manage your personal information and account details</p>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>Personal Information</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="userProfile.firstName" placeholder="Enter first name">
                </div>
                
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="userProfile.lastName" placeholder="Enter last name">
                </div>
                
                <div class="form-group full-width">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="userProfile.email" placeholder="Enter email address">
                </div>
                
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" [(ngModel)]="userProfile.phone" placeholder="Enter phone number">
                </div>
                
                <div class="form-group">
                  <label>Role</label>
                  <select [(ngModel)]="userProfile.role">
                    <option value="admin">Administrator</option>
                    <option value="manager">Fleet Manager</option>
                    <option value="operator">Operator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                
                <div class="form-group full-width">
                  <label>Department</label>
                  <input type="text" [(ngModel)]="userProfile.department" placeholder="Enter department">
                </div>
              </div>
            </div>

            <div class="settings-card">
              <h3>Profile Image</h3>
              <div class="profile-image-section">
                <div class="current-image">
                  <div class="image-placeholder">
                    <i class="pi pi-user"></i>
                  </div>
                </div>
                <div class="image-actions">
                  <button class="btn btn--secondary">Upload New Image</button>
                  <button class="btn btn--tertiary">Remove Image</button>
                  <p class="image-note">Recommended: 200x200px, max 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Preferences -->
        <div class="settings-section" *ngIf="selectedCategory === 'system'">
          <div class="section-header">
            <h2>System Preferences</h2>
            <p>Configure system-wide settings and preferences</p>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>Localization</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Language</label>
                  <select [(ngModel)]="systemPreferences.language">
                    <option value="en">English</option>
                    <option value="ko">Korean (한국어)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="fr">French (Français)</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Timezone</label>
                  <select [(ngModel)]="systemPreferences.timezone">
                    <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Date Format</label>
                  <select [(ngModel)]="systemPreferences.dateFormat">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Currency</label>
                  <select [(ngModel)]="systemPreferences.currency">
                    <option value="KRW">Korean Won (₩)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="settings-card">
              <h3>Units & Measurements</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Distance Unit</label>
                  <select [(ngModel)]="systemPreferences.distanceUnit">
                    <option value="km">Kilometers</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Temperature Unit</label>
                  <select [(ngModel)]="systemPreferences.temperatureUnit">
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Auto Logout (minutes)</label>
                  <select [(ngModel)]="systemPreferences.autoLogout">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                    <option value="0">Never</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="settings-section" *ngIf="selectedCategory === 'notifications'">
          <div class="section-header">
            <h2>Notification Settings</h2>
            <p>Configure how and when you receive alerts and notifications</p>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>Delivery Methods</h3>
              <div class="toggle-group">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Email Alerts</span>
                    <span class="toggle-description">Receive notifications via email</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.emailAlerts">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">SMS Alerts</span>
                    <span class="toggle-description">Receive critical alerts via SMS</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.smsAlerts">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Push Notifications</span>
                    <span class="toggle-description">Browser push notifications</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.pushNotifications">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="settings-card">
              <h3>Alert Types</h3>
              <div class="toggle-group">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Safety Incidents</span>
                    <span class="toggle-description">Accidents, speeding, harsh braking</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.safetyIncidents">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Maintenance Reminders</span>
                    <span class="toggle-description">Service schedules and overdue maintenance</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.maintenanceReminders">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Low Battery Warnings</span>
                    <span class="toggle-description">Battery level below threshold</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.lowBattery">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Geofence Violations</span>
                    <span class="toggle-description">Vehicles entering/leaving designated areas</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.geofenceViolations">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Report Generation</span>
                    <span class="toggle-description">Completed reports and scheduled reports</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notificationSettings.reportGeneration">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fleet Configuration -->
        <div class="settings-section" *ngIf="selectedCategory === 'fleet'">
          <div class="section-header">
            <h2>Fleet Configuration</h2>
            <p>Configure fleet-specific settings and monitoring parameters</p>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>Map & Tracking</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Default Map View</label>
                  <select [(ngModel)]="fleetConfiguration.defaultMapView">
                    <option value="roadmap">Road Map</option>
                    <option value="satellite">Satellite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="terrain">Terrain</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Tracking Interval (seconds)</label>
                  <select [(ngModel)]="fleetConfiguration.trackingInterval">
                    <option value="10">10 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Geofence Buffer (meters)</label>
                  <input type="number" [(ngModel)]="fleetConfiguration.geofenceBuffer" min="50" max="1000">
                </div>
                
                <div class="form-group">
                  <label>Max Idle Time (minutes)</label>
                  <input type="number" [(ngModel)]="fleetConfiguration.maxIdleTime" min="5" max="60">
                </div>
              </div>
            </div>

            <div class="settings-card">
              <h3>Alert Thresholds</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Speed Warning (km/h)</label>
                  <input type="number" [(ngModel)]="fleetConfiguration.speedThresholds.warning" min="40" max="100">
                </div>
                
                <div class="form-group">
                  <label>Speed Critical (km/h)</label>
                  <input type="number" [(ngModel)]="fleetConfiguration.speedThresholds.critical" min="60" max="120">
                </div>
                
                <div class="form-group">
                  <label>Battery Low (%)</label>
                  <input type="number" [(ngModel)]="fleetConfiguration.batteryThresholds.low" min="10" max="30">
                </div>
                
                <div class="form-group">
                  <label>Battery Critical (%)</label>
                  <input type="number" [(ngModel)]="fleetConfiguration.batteryThresholds.critical" min="5" max="15">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="settings-section" *ngIf="selectedCategory === 'security'">
          <div class="section-header">
            <h2>Security Settings</h2>
            <p>Manage security preferences and access controls</p>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>Authentication</h3>
              <div class="toggle-group">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Two-Factor Authentication</span>
                    <span class="toggle-description">Enable 2FA for enhanced security</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="securitySettings.twoFactorAuth">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">API Access</span>
                    <span class="toggle-description">Allow API access for integrations</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="securitySettings.apiAccessEnabled">
                    <span class="slider"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-label">Audit Logging</span>
                    <span class="toggle-description">Log all user actions for security</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="securitySettings.auditLogging">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="settings-card">
              <h3>Session Management</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Session Timeout (minutes)</label>
                  <select [(ngModel)]="securitySettings.sessionTimeout">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Password Expiry (days)</label>
                  <select [(ngModel)]="securitySettings.passwordExpiry">
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="0">Never</option>
                  </select>
                </div>
              </div>
              
              <div class="action-buttons">
                <button class="btn btn--secondary">Change Password</button>
                <button class="btn btn--tertiary">View Active Sessions</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Data & Privacy -->
        <div class="settings-section" *ngIf="selectedCategory === 'privacy'">
          <div class="section-header">
            <h2>Data & Privacy</h2>
            <p>Manage data retention, privacy settings, and compliance</p>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>Data Retention</h3>
              <div class="data-retention-info">
                <div class="retention-item">
                  <span class="data-type">Vehicle Tracking Data</span>
                  <span class="retention-period">90 days</span>
                </div>
                <div class="retention-item">
                  <span class="data-type">Safety Incident Reports</span>
                  <span class="retention-period">2 years</span>
                </div>
                <div class="retention-item">
                  <span class="data-type">Maintenance Records</span>
                  <span class="retention-period">5 years</span>
                </div>
                <div class="retention-item">
                  <span class="data-type">User Activity Logs</span>
                  <span class="retention-period">1 year</span>
                </div>
              </div>
              
              <div class="action-buttons">
                <button class="btn btn--secondary">Export My Data</button>
                <button class="btn btn--tertiary">View Privacy Policy</button>
              </div>
            </div>

            <div class="settings-card">
              <h3>Privacy Controls</h3>
              <div class="privacy-controls">
                <div class="control-item">
                  <h4>Location Tracking</h4>
                  <p>Allow system to track vehicle locations for fleet management</p>
                  <div class="control-status enabled">
                    <i class="pi pi-check-circle"></i>
                    <span>Enabled (Required for fleet operations)</span>
                  </div>
                </div>
                
                <div class="control-item">
                  <h4>Usage Analytics</h4>
                  <p>Help improve the system by sharing anonymous usage data</p>
                  <div class="control-toggle">
                    <label class="toggle-switch">
                      <input type="checkbox" checked>
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- About & System Info -->
        <div class="settings-section" *ngIf="selectedCategory === 'about'">
          <div class="section-header">
            <h2>About</h2>
            <p>System information and support resources</p>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>System Information</h3>
              <div class="system-info">
                <div class="info-item">
                  <span class="info-label">Application Version</span>
                  <span class="info-value">v1.0.0</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Build Date</span>
                  <span class="info-value">{{ getBuildDate() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Update</span>
                  <span class="info-value">{{ getLastUpdate() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Environment</span>
                  <span class="info-value">Production</span>
                </div>
              </div>
            </div>

            <div class="settings-card">
              <h3>Support & Resources</h3>
              <div class="support-links">
                <a href="#" class="support-link">
                  <i class="pi pi-book"></i>
                  <span>User Documentation</span>
                  <i class="pi pi-external-link"></i>
                </a>
                <a href="#" class="support-link">
                  <i class="pi pi-question-circle"></i>
                  <span>Help Center</span>
                  <i class="pi pi-external-link"></i>
                </a>
                <a href="#" class="support-link">
                  <i class="pi pi-phone"></i>
                  <span>Contact Support</span>
                  <i class="pi pi-external-link"></i>
                </a>
                <a href="#" class="support-link">
                  <i class="pi pi-shield"></i>
                  <span>Security Policy</span>
                  <i class="pi pi-external-link"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Actions -->
      <div class="save-actions" *ngIf="hasUnsavedChanges">
        <div class="save-bar">
          <div class="save-message">
            <i class="pi pi-exclamation-triangle"></i>
            <span>You have unsaved changes</span>
          </div>
          <div class="save-buttons">
            <button class="btn btn--tertiary" (click)="discardChanges()">Discard</button>
            <button class="btn btn--primary" (click)="saveSettings()">
              <i class="pi pi-check"></i>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  selectedCategory = 'profile';
  hasUnsavedChanges = false;

  settingsCategories = [
    { id: 'profile', name: 'Profile', icon: 'pi-user' },
    { id: 'system', name: 'System', icon: 'pi-cog' },
    { id: 'notifications', name: 'Notifications', icon: 'pi-bell' },
    { id: 'fleet', name: 'Fleet', icon: 'pi-car' },
    { id: 'security', name: 'Security', icon: 'pi-shield' },
    { id: 'privacy', name: 'Privacy', icon: 'pi-lock' },
    { id: 'about', name: 'About', icon: 'pi-info-circle' }
  ];

  userProfile: UserProfile = {
    firstName: 'Jin-Ho',
    lastName: 'Kim',
    email: 'j.kim@kia.com',
    phone: '+82 10-1234-5678',
    role: 'manager',
    department: 'Fleet Operations'
  };

  systemPreferences: SystemPreferences = {
    language: 'en',
    timezone: 'Asia/Seoul',
    dateFormat: 'DD/MM/YYYY',
    temperatureUnit: 'celsius',
    distanceUnit: 'km',
    currency: 'KRW',
    autoLogout: 60
  };

  notificationSettings: NotificationSettings = {
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    safetyIncidents: true,
    maintenanceReminders: true,
    lowBattery: true,
    geofenceViolations: true,
    reportGeneration: false
  };

  securitySettings: SecuritySettings = {
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    apiAccessEnabled: false,
    auditLogging: true,
    ipRestrictions: false,
    allowedIPs: []
  };

  fleetConfiguration: FleetConfiguration = {
    defaultMapView: 'roadmap',
    trackingInterval: 30,
    geofenceBuffer: 100,
    maxIdleTime: 15,
    speedThresholds: {
      warning: 80,
      critical: 100
    },
    batteryThresholds: {
      low: 20,
      critical: 10
    }
  };

  ngOnInit(): void {
    // Initialize settings and detect changes
    this.detectChanges();
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  detectChanges(): void {
    // In a real app, this would compare current values with saved values
    // For demo purposes, we'll simulate unsaved changes
    setTimeout(() => {
      this.hasUnsavedChanges = false;
    }, 1000);
  }

  saveSettings(): void {
    console.log('Saving settings...');
    // Simulate save operation
    this.hasUnsavedChanges = false;
    
    // Show success notification (in real app)
    console.log('Settings saved successfully');
  }

  discardChanges(): void {
    console.log('Discarding changes...');
    this.hasUnsavedChanges = false;
    
    // Reset to original values (in real app)
    this.ngOnInit();
  }

  exportSettings(): void {
    console.log('Exporting settings...');
    // In real app, this would generate a downloadable file
  }

  resetToDefaults(): void {
    console.log('Resetting to defaults...');
    // In real app, this would reset all settings to default values
  }

  getBuildDate(): string {
    return new Date().toLocaleDateString();
  }

  getLastUpdate(): string {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
  }
} 