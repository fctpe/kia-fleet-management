import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SafetyMetrics {
  overallScore: number;
  totalIncidents: number;
  riskLevel: 'low' | 'medium' | 'high';
  complianceRate: number;
  activeDangerZones: number;
  lastIncident: Date;
}

interface SafetyIncident {
  id: string;
  type: 'speeding' | 'harsh_braking' | 'collision' | 'fatigue' | 'distraction' | 'route_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  vehicleId: string;
  driverName: string;
  location: string;
  timestamp: Date;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
}

interface DriverSafetyProfile {
  driverId: string;
  name: string;
  safetyScore: number;
  totalMiles: number;
  incidentCount: number;
  lastIncident?: Date;
  riskCategory: 'excellent' | 'good' | 'fair' | 'poor';
  trends: {
    speedingEvents: number;
    harshBraking: number;
    fatigueSigns: number;
  };
}

interface SafetyAlert {
  id: string;
  type: 'real_time' | 'predictive' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  vehicleId?: string;
  timestamp: Date;
  acknowledged: boolean;
}

@Component({
  selector: 'app-safety-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="safety-monitor">
      <!-- Header Section -->
      <div class="safety-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Safety Monitor</h1>
            <p class="safety-subtitle">Real-time safety intelligence and driver behavior analysis</p>
          </div>
          
          <!-- Live Status Indicator -->
          <div class="live-status">
            <div class="status-indicator status-indicator--online">
              <i class="pi pi-circle-fill"></i>
              <span>Live Monitoring</span>
            </div>
            <div class="last-update">
              Updated: {{ getTimeAgo(lastUpdate) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Safety Metrics Overview -->
      <div class="metrics-section">
        <div class="metrics-grid">
          <div class="metric-card" [class.metric-card--warning]="safetyMetrics.overallScore < 80">
            <div class="metric-icon" [class.warning]="safetyMetrics.overallScore < 80">
              <i class="pi pi-shield"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ safetyMetrics.overallScore }}/100</div>
              <div class="metric-label">Overall Safety Score</div>
              <div class="metric-change" [class]="getSafetyScoreClass()">
                {{ getSafetyScoreText() }}
              </div>
            </div>
          </div>

          <div class="metric-card" [class.metric-card--alert]="safetyMetrics.totalIncidents > 0">
            <div class="metric-icon" [class.alert]="safetyMetrics.totalIncidents > 0">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ safetyMetrics.totalIncidents }}</div>
              <div class="metric-label">Active Incidents</div>
              <div class="metric-change">
                Last: {{ getTimeAgo(safetyMetrics.lastIncident) }}
              </div>
            </div>
          </div>

          <div class="metric-card" [class.metric-card--risk]="safetyMetrics.riskLevel === 'high'">
            <div class="metric-icon" [class]="'risk-' + safetyMetrics.riskLevel">
              <i class="pi pi-chart-line"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ safetyMetrics.riskLevel | titlecase }}</div>
              <div class="metric-label">Current Risk Level</div>
              <div class="metric-change">
                {{ safetyMetrics.activeDangerZones }} danger zones
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ safetyMetrics.complianceRate }}%</div>
              <div class="metric-label">Compliance Rate</div>
              <div class="metric-change positive">
                +2.1% this month
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-content">
        <div class="content-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Recent Safety Incidents -->
            <div class="safety-card">
              <div class="card-header">
                <h3>Recent Safety Incidents</h3>
                <div class="header-actions">
                  <button class="btn btn--tertiary" (click)="refreshIncidents()">
                    <i class="pi pi-refresh"></i>
                    Refresh
                  </button>
                </div>
              </div>
              
              <div class="incidents-list">
                <div 
                  *ngFor="let incident of recentIncidents; trackBy: trackByIncidentId" 
                  class="incident-item"
                  [class]="'incident--' + incident.severity"
                  (click)="selectIncident(incident)"
                >
                  <div class="incident-icon">
                    <i class="pi" [class]="getIncidentIcon(incident.type)"></i>
                  </div>
                  
                  <div class="incident-content">
                    <div class="incident-header">
                      <span class="incident-type">{{ getIncidentTypeLabel(incident.type) }}</span>
                      <span class="incident-time">{{ getTimeAgo(incident.timestamp) }}</span>
                    </div>
                    
                    <div class="incident-details">
                      <span class="vehicle-id">{{ incident.vehicleId }}</span>
                      <span class="driver-name">{{ incident.driverName }}</span>
                    </div>
                    
                    <div class="incident-location">
                      <i class="pi pi-map-marker"></i>
                      {{ incident.location }}
                    </div>
                  </div>
                  
                  <div class="incident-status">
                    <span class="status-badge" [class]="'status--' + incident.status">
                      {{ incident.status | titlecase }}
                    </span>
                  </div>
                </div>
                
                <div class="incidents-empty" *ngIf="recentIncidents.length === 0">
                  <i class="pi pi-check-circle"></i>
                  <p>No recent incidents</p>
                  <span class="text-small">Your fleet is operating safely</span>
                </div>
              </div>
            </div>

            <!-- Driver Safety Profiles -->
            <div class="safety-card">
              <div class="card-header">
                <h3>Driver Safety Profiles</h3>
                <div class="header-actions">
                  <select [(ngModel)]="selectedRiskFilter" (ngModelChange)="filterDrivers()" class="filter-select">
                    <option value="all">All Drivers</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              
              <div class="drivers-list">
                <div 
                  *ngFor="let driver of filteredDrivers; trackBy: trackByDriverId" 
                  class="driver-item"
                  [class]="'driver--' + driver.riskCategory"
                >
                  <div class="driver-avatar">
                    <i class="pi pi-user"></i>
                  </div>
                  
                  <div class="driver-info">
                    <div class="driver-name">{{ driver.name }}</div>
                    <div class="driver-stats">
                      <span class="stat">{{ driver.totalMiles.toLocaleString() }} km</span>
                      <span class="stat">{{ driver.incidentCount }} incidents</span>
                    </div>
                  </div>
                  
                  <div class="driver-score">
                    <div class="score-circle" [class]="getScoreClass(driver.safetyScore)">
                      <span class="score-value">{{ driver.safetyScore }}</span>
                    </div>
                    <div class="score-label">Safety Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- Live Safety Alerts -->
            <div class="safety-card">
              <div class="card-header">
                <h3>Live Safety Alerts</h3>
                <div class="alert-count" *ngIf="getUnacknowledgedAlerts().length > 0">
                  {{ getUnacknowledgedAlerts().length }} new
                </div>
              </div>
              
              <div class="alerts-list">
                <div 
                  *ngFor="let alert of safetyAlerts.slice(0, 5); trackBy: trackByAlertId" 
                  class="alert-item"
                  [class]="'alert--' + alert.priority"
                  [class.unacknowledged]="!alert.acknowledged"
                >
                  <div class="alert-icon">
                    <i class="pi" [class]="getAlertIcon(alert.type)"></i>
                  </div>
                  
                  <div class="alert-content">
                    <div class="alert-message">{{ alert.message }}</div>
                    <div class="alert-meta">
                      <span class="alert-time">{{ getTimeAgo(alert.timestamp) }}</span>
                      <span class="alert-vehicle" *ngIf="alert.vehicleId">{{ alert.vehicleId }}</span>
                    </div>
                  </div>
                  
                  <div class="alert-actions" *ngIf="!alert.acknowledged">
                    <button class="btn btn--tertiary btn--small" (click)="acknowledgeAlert(alert.id)">
                      <i class="pi pi-check"></i>
                    </button>
                  </div>
                </div>
                
                <div class="alerts-empty" *ngIf="safetyAlerts.length === 0">
                  <i class="pi pi-shield"></i>
                  <p>All systems normal</p>
                  <span class="text-small">No active safety alerts</span>
                </div>
              </div>
            </div>

            <!-- Safety Analytics -->
            <div class="safety-card">
              <div class="card-header">
                <h3>Safety Analytics</h3>
                <div class="period-selector">
                  <button 
                    *ngFor="let period of analyticsPeriods" 
                    class="btn btn--tertiary btn--small"
                    [class.active]="selectedPeriod === period"
                    (click)="selectedPeriod = period"
                  >
                    {{ period }}
                  </button>
                </div>
              </div>
              
              <div class="analytics-content">
                <!-- Safety Trends -->
                <div class="trend-section">
                  <h4>Safety Trends ({{ selectedPeriod }})</h4>
                  <div class="trends-grid">
                    <div class="trend-item">
                      <div class="trend-icon speeding">
                        <i class="pi pi-forward"></i>
                      </div>
                      <div class="trend-data">
                        <span class="trend-value">{{ safetyTrends.speeding }}</span>
                        <span class="trend-label">Speeding Events</span>
                        <span class="trend-change negative">+12%</span>
                      </div>
                    </div>
                    
                    <div class="trend-item">
                      <div class="trend-icon braking">
                        <i class="pi pi-minus-circle"></i>
                      </div>
                      <div class="trend-data">
                        <span class="trend-value">{{ safetyTrends.harshBraking }}</span>
                        <span class="trend-label">Harsh Braking</span>
                        <span class="trend-change positive">-8%</span>
                      </div>
                    </div>
                    
                    <div class="trend-item">
                      <div class="trend-icon fatigue">
                        <i class="pi pi-moon"></i>
                      </div>
                      <div class="trend-data">
                        <span class="trend-value">{{ safetyTrends.fatigue }}</span>
                        <span class="trend-label">Fatigue Detection</span>
                        <span class="trend-change positive">-15%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Risk Assessment -->
                <div class="risk-section">
                  <h4>Risk Assessment</h4>
                  <div class="risk-breakdown">
                    <div class="risk-item">
                      <span class="risk-label">Driver Behavior</span>
                      <div class="risk-bar">
                        <div class="risk-fill" style="width: 75%"></div>
                      </div>
                      <span class="risk-value">75%</span>
                    </div>
                    
                    <div class="risk-item">
                      <span class="risk-label">Route Safety</span>
                      <div class="risk-bar">
                        <div class="risk-fill" style="width: 88%"></div>
                      </div>
                      <span class="risk-value">88%</span>
                    </div>
                    
                    <div class="risk-item">
                      <span class="risk-label">Vehicle Condition</span>
                      <div class="risk-bar">
                        <div class="risk-fill" style="width: 92%"></div>
                      </div>
                      <span class="risk-value">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Safety Map View -->
      <div class="map-section" *ngIf="showMap">
        <div class="safety-card">
          <div class="card-header">
            <h3>Safety Incidents Map</h3>
            <div class="map-controls">
              <button class="btn btn--tertiary" (click)="toggleMap()">
                <i class="pi pi-eye-slash"></i>
                Hide Map
              </button>
            </div>
          </div>
          
          <div class="safety-map">
            <div class="map-container">
              <div class="seoul-map-bg"></div>
              
              <!-- Incident Markers -->
              <div 
                *ngFor="let incident of mapIncidents; trackBy: trackByIncidentId" 
                class="incident-marker" 
                [class]="'incident-marker--' + incident.severity"
                [style.left.%]="getRandomPosition()" 
                [style.top.%]="getRandomPosition()"
                (click)="selectIncident(incident)"
                [title]="incident.description"
              >
                <div class="marker-icon">
                  <i class="pi" [class]="getIncidentIcon(incident.type)"></i>
                </div>
                <div class="marker-pulse" [class.active]="incident.severity === 'critical'"></div>
              </div>
            </div>
            
            <!-- Map Legend -->
            <div class="map-legend">
              <div class="legend-item">
                <span class="legend-dot critical"></span>
                <span>Critical</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot high"></span>
                <span>High Risk</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot medium"></span>
                <span>Medium Risk</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot low"></span>
                <span>Low Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" *ngIf="!showMap">
        <button class="btn btn--primary" (click)="toggleMap()">
          <i class="pi pi-map"></i>
          View Safety Map
        </button>
        <button class="btn btn--secondary" (click)="exportSafetyReport()">
          <i class="pi pi-download"></i>
          Export Report
        </button>
        <button class="btn btn--accent" (click)="configureAlerts()">
          <i class="pi pi-cog"></i>
          Configure Alerts
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./safety-monitor.component.scss']
})
export class SafetyMonitorComponent implements OnInit, OnDestroy {
  safetyMetrics: SafetyMetrics = {
    overallScore: 87,
    totalIncidents: 3,
    riskLevel: 'medium',
    complianceRate: 94,
    activeDangerZones: 2,
    lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  };

  recentIncidents: SafetyIncident[] = [];
  driverProfiles: DriverSafetyProfile[] = [];
  filteredDrivers: DriverSafetyProfile[] = [];
  safetyAlerts: SafetyAlert[] = [];
  mapIncidents: SafetyIncident[] = [];

  selectedRiskFilter = 'all';
  selectedPeriod = '7 days';
  analyticsPeriods = ['24h', '7 days', '30 days', '90 days'];
  showMap = false;
  lastUpdate = new Date();

  safetyTrends = {
    speeding: 23,
    harshBraking: 15,
    fatigue: 7
  };

  private updateInterval: any;

  ngOnInit(): void {
    this.generateMockData();
    this.filteredDrivers = [...this.driverProfiles];
    
    // Simulate real-time updates
    this.updateInterval = setInterval(() => {
      this.updateSafetyData();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  generateMockData(): void {
    // Generate mock incidents
    this.recentIncidents = [
      {
        id: 'INC-001',
        type: 'speeding',
        severity: 'medium',
        vehicleId: 'KIA-042',
        driverName: 'Kim Min-jun',
        location: 'Gangnam-gu, Seoul',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'investigating',
        description: 'Speed limit exceeded by 15 km/h'
      },
      {
        id: 'INC-002',
        type: 'harsh_braking',
        severity: 'low',
        vehicleId: 'KIA-018',
        driverName: 'Lee So-young',
        location: 'Jung-gu, Seoul',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'resolved',
        description: 'Emergency braking event detected'
      },
      {
        id: 'INC-003',
        type: 'fatigue',
        severity: 'high',
        vehicleId: 'KIA-067',
        driverName: 'Park Ji-hoon',
        location: 'Songpa-gu, Seoul',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'open',
        description: 'Driver fatigue signs detected'
      }
    ];

    // Generate mock driver profiles
    const drivers = ['Kim Min-jun', 'Lee So-young', 'Park Ji-hoon', 'Choi Su-bin', 'Jung Hae-won', 'Song Da-eun'];
    this.driverProfiles = drivers.map((name, index) => ({
      driverId: `DRV-${String(index + 1).padStart(3, '0')}`,
      name,
      safetyScore: Math.floor(Math.random() * 30) + 70,
      totalMiles: Math.floor(Math.random() * 50000) + 10000,
      incidentCount: Math.floor(Math.random() * 10),
      lastIncident: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      riskCategory: this.getRiskCategory(Math.floor(Math.random() * 30) + 70),
      trends: {
        speedingEvents: Math.floor(Math.random() * 10),
        harshBraking: Math.floor(Math.random() * 8),
        fatigueSigns: Math.floor(Math.random() * 5)
      }
    }));

    // Generate mock alerts
    this.safetyAlerts = [
      {
        id: 'ALT-001',
        type: 'real_time',
        priority: 'critical',
        message: 'Critical speeding detected on KIA-042',
        vehicleId: 'KIA-042',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        acknowledged: false
      },
      {
        id: 'ALT-002',
        type: 'predictive',
        priority: 'medium',
        message: 'Driver fatigue predicted for Park Ji-hoon',
        vehicleId: 'KIA-067',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        acknowledged: true
      },
      {
        id: 'ALT-003',
        type: 'compliance',
        priority: 'low',
        message: 'Route deviation detected',
        vehicleId: 'KIA-025',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false
      }
    ];

    this.mapIncidents = [...this.recentIncidents];
  }

  getRiskCategory(score: number): DriverSafetyProfile['riskCategory'] {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  }

  trackByIncidentId(index: number, incident: SafetyIncident): string {
    return incident.id;
  }

  trackByDriverId(index: number, driver: DriverSafetyProfile): string {
    return driver.driverId;
  }

  trackByAlertId(index: number, alert: SafetyAlert): string {
    return alert.id;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  getSafetyScoreClass(): string {
    const score = this.safetyMetrics.overallScore;
    if (score >= 90) return 'positive';
    if (score >= 80) return 'neutral';
    return 'negative';
  }

  getSafetyScoreText(): string {
    const score = this.safetyMetrics.overallScore;
    if (score >= 90) return 'Excellent safety performance';
    if (score >= 80) return 'Good safety performance';
    return 'Needs improvement';
  }

  getIncidentIcon(type: string): string {
    const icons = {
      speeding: 'pi-forward',
      harsh_braking: 'pi-minus-circle',
      collision: 'pi-times-circle',
      fatigue: 'pi-moon',
      distraction: 'pi-mobile',
      route_violation: 'pi-map'
    };
    return icons[type as keyof typeof icons] || 'pi-exclamation-triangle';
  }

  getIncidentTypeLabel(type: string): string {
    const labels = {
      speeding: 'Speeding',
      harsh_braking: 'Harsh Braking',
      collision: 'Collision',
      fatigue: 'Driver Fatigue',
      distraction: 'Distraction',
      route_violation: 'Route Violation'
    };
    return labels[type as keyof typeof labels] || type;
  }

  getAlertIcon(type: string): string {
    const icons = {
      real_time: 'pi-exclamation-triangle',
      predictive: 'pi-chart-line',
      compliance: 'pi-info-circle'
    };
    return icons[type as keyof typeof icons] || 'pi-bell';
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  }

  getRandomPosition(): number {
    return Math.random() * 80 + 10;
  }

  getUnacknowledgedAlerts(): SafetyAlert[] {
    return this.safetyAlerts.filter(alert => !alert.acknowledged);
  }

  filterDrivers(): void {
    if (this.selectedRiskFilter === 'all') {
      this.filteredDrivers = [...this.driverProfiles];
    } else {
      this.filteredDrivers = this.driverProfiles.filter(
        driver => driver.riskCategory === this.selectedRiskFilter
      );
    }
  }

  selectIncident(incident: SafetyIncident): void {
    console.log('Selected incident:', incident);
    // Implement incident detail view
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.safetyAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  refreshIncidents(): void {
    console.log('Refreshing incidents...');
    this.lastUpdate = new Date();
  }

  toggleMap(): void {
    this.showMap = !this.showMap;
  }

  exportSafetyReport(): void {
    console.log('Exporting safety report...');
  }

  configureAlerts(): void {
    console.log('Configuring alerts...');
  }

  updateSafetyData(): void {
    // Simulate real-time updates
    this.lastUpdate = new Date();
    
    // Randomly update some metrics
    if (Math.random() > 0.7) {
      this.safetyMetrics.overallScore += Math.random() > 0.5 ? 1 : -1;
      this.safetyMetrics.overallScore = Math.max(70, Math.min(100, this.safetyMetrics.overallScore));
    }
  }
} 