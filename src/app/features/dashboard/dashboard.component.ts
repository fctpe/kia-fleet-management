import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components only in browser
if (typeof window !== 'undefined') {
  Chart.register(...registerables);
}

interface AlertItem {
  id: number;
  type: 'info' | 'warning' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-demo">
      <!-- Enhanced Header Section with Live Updates -->
      <div class="demo-header">
        <h1>KIA PBV Fleet Management System</h1>
        <p class="demo-subtitle">Real-time fleet monitoring and data insights for Purpose Built Vehicles</p>
        <div class="system-status-banner">
          <div class="status-item">
            <i class="pi pi-circle-fill status-online"></i>
            <span>All Systems Operational</span>
          </div>
          <div class="status-item">
            <i class="pi pi-clock"></i>
            <span>Last Update: {{ currentTime | date:'short' }}</span>
          </div>
        </div>
      </div>

            <!-- Live Alerts Section -->
      <div class="alerts-section" *ngIf="unreadAlerts.length > 0">
        <div class="alert-banner" 
             [class.alert-info]="alert.type === 'info'"
             [class.alert-warning]="alert.type === 'warning'"
             *ngFor="let alert of unreadAlerts.slice(0, 2)">
          <i class="pi" [class.pi-info-circle]="alert.type === 'info'" 
                       [class.pi-exclamation-triangle]="alert.type === 'warning'"
                       [class.pi-check-circle]="alert.type === 'success'"></i>
          <span>{{ alert.message }}</span>
          <button class="alert-close" (click)="dismissAlert(alert.id)">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Enhanced Key Metrics Grid with Animations -->
      <div class="metrics-grid">
        <div class="metric-card card--interactive" 
             [class.metric-card--selected]="selectedMetric === 'vehicles'" 
             (click)="selectMetric('vehicles')"
             [attr.data-aos]="'fade-up'"
             [attr.data-aos-delay]="'100'">
          <div class="metric-icon">
            <i class="pi pi-car"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value animated-counter" #vehicleCounter>{{ displayedMetrics.activeVehicles }}</div>
            <div class="metric-label">Active Vehicles</div>
            <div class="metric-change positive">
              <i class="pi pi-arrow-up"></i>
              +2 from yesterday
            </div>
          </div>
          <div class="metric-chart">
            <canvas #vehicleChart width="100" height="40"></canvas>
          </div>
        </div>

        <div class="metric-card card--interactive" 
             [class.metric-card--selected]="selectedMetric === 'uptime'" 
             (click)="selectMetric('uptime')"
             [attr.data-aos]="'fade-up'"
             [attr.data-aos-delay]="'200'">
          <div class="metric-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value animated-counter" #uptimeCounter>{{ displayedMetrics.uptime }}%</div>
            <div class="metric-label">Fleet Uptime</div>
            <div class="metric-change positive">
              <i class="pi pi-arrow-up"></i>
              +0.3% from last week
            </div>
          </div>
          <div class="progress-ring">
            <svg width="60" height="60">
              <circle cx="30" cy="30" r="25" [attr.stroke-dasharray]="getCircumference()" 
                      [attr.stroke-dashoffset]="getUptimeOffset()" class="progress-circle"></circle>
            </svg>
          </div>
        </div>

        <div class="metric-card card--interactive" 
             [class.metric-card--selected]="selectedMetric === 'distance'" 
             (click)="selectMetric('distance')"
             [attr.data-aos]="'fade-up'"
             [attr.data-aos-delay]="'300'">
          <div class="metric-icon">
            <i class="pi pi-map"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value animated-counter" #distanceCounter>{{ displayedMetrics.todayDistance }} km</div>
            <div class="metric-label">Today's Distance</div>
            <div class="metric-change positive">
              <i class="pi pi-arrow-up"></i>
              +15% vs average
            </div>
          </div>
          <div class="sparkline-container">
            <canvas #distanceSparkline width="80" height="30"></canvas>
          </div>
        </div>

        <div class="metric-card card--interactive" 
             [class.metric-card--selected]="selectedMetric === 'efficiency'" 
             (click)="selectMetric('efficiency')"
             [attr.data-aos]="'fade-up'"
             [attr.data-aos-delay]="'400'">
          <div class="metric-icon">
            <i class="pi pi-bolt"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value animated-counter" #efficiencyCounter>{{ displayedMetrics.efficiency }} kWh/100km</div>
            <div class="metric-label">Avg. Energy Efficiency</div>
            <div class="metric-change positive">
              <i class="pi pi-arrow-down"></i>
              -5% vs target
            </div>
          </div>
          <div class="efficiency-gauge">
            <div class="gauge-fill" [style.width.%]="getEfficiencyPercentage()"></div>
          </div>
        </div>
      </div>

      <!-- Enhanced Interactive Features Section -->
      <div class="features-section" data-aos="fade-up" data-aos-delay="500">
        <h2>Explore Fleet Management Features</h2>
        <div class="features-grid">
          <div class="feature-demo card--interactive" (click)="navigateToFleet()" data-aos="zoom-in" data-aos-delay="100">
            <div class="feature-header">
              <i class="pi pi-car"></i>
              <h3>Live Fleet Tracking</h3>
            </div>
            <p class="body-large">Monitor all vehicles in real-time with interactive maps and status updates</p>
            <div class="demo-preview">
              <div class="mini-map">
                <div class="vehicle-dot" *ngFor="let vehicle of sampleVehicles; index as i" 
                     [style.left.%]="vehicle.mapX" 
                     [style.top.%]="vehicle.mapY"
                     [class]="'vehicle-dot--' + vehicle.status"
                     [style.animation-delay.ms]="i * 200">
                </div>
                <div class="map-grid"></div>
              </div>
            </div>
            <button class="btn btn--tertiary">
              Explore Fleet View
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>

          <div class="feature-demo card--interactive" (click)="navigateToEnergy()" data-aos="zoom-in" data-aos-delay="200">
            <div class="feature-header">
              <i class="pi pi-bolt"></i>
              <h3>Energy Analytics</h3>
            </div>
            <p class="body-large">Optimize energy consumption and reduce operational costs</p>
            <div class="demo-preview">
              <div class="mini-chart">
                <canvas #energyChart width="200" height="100"></canvas>
              </div>
            </div>
            <button class="btn btn--tertiary">
              View Energy Dashboard
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>

          <div class="feature-demo card--interactive" (click)="navigateToSafety()" data-aos="zoom-in" data-aos-delay="300">
            <div class="feature-header">
              <i class="pi pi-shield"></i>
              <h3>Safety Intelligence</h3>
            </div>
            <p class="body-large">Advanced driver behavior analysis and safety incident tracking</p>
                         <div class="demo-preview">
               <div class="safety-score">
                 <div class="score-display">
                  <span class="score-value" #safetyScoreCounter>{{ displayedMetrics.safetyScore }}</span>
                   <span class="score-suffix">/100</span>
                 </div>
                 <div class="score-label">Safety Score</div>
                <div class="score-bar">
                  <div class="score-fill" [style.width.%]="displayedMetrics.safetyScore"></div>
                </div>
               </div>
             </div>
            <button class="btn btn--tertiary">
              Open Safety Monitor
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Real-time Data Section -->
      <div class="realtime-section" data-aos="fade-up" data-aos-delay="700">
        <h2>Real-time Fleet Status</h2>
        <div class="realtime-grid">
          <div class="realtime-card">
            <div class="realtime-header">
              <h4>Active Missions</h4>
              <span class="pulse-indicator"></span>
            </div>
            <div class="mission-list">
              <div class="mission-item" *ngFor="let mission of activeMissions">
                <div class="mission-info">
                  <span class="mission-id">{{ mission.id }}</span>
                  <span class="mission-route">{{ mission.route }}</span>
                </div>
                <div class="mission-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="mission.progress"></div>
                  </div>
                  <span class="progress-text">{{ mission.progress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="realtime-card">
            <div class="realtime-header">
              <h4>System Health</h4>
              <span class="status-online">Online</span>
            </div>
            <div class="health-metrics">
              <div class="health-item">
                <span class="health-label">Database</span>
                <div class="health-indicator good">
                  <i class="pi pi-check"></i>
                </div>
              </div>
              <div class="health-item">
                <span class="health-label">API Response</span>
                <div class="health-indicator good">
                  <span class="response-time">{{ apiResponseTime }}ms</span>
                </div>
              </div>
              <div class="health-item">
                <span class="health-label">Vehicle Connectivity</span>
                <div class="health-indicator good">
                  <span class="connectivity">98.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('vehicleCounter') vehicleCounter!: ElementRef;
  @ViewChild('uptimeCounter') uptimeCounter!: ElementRef;
  @ViewChild('distanceCounter') distanceCounter!: ElementRef;
  @ViewChild('efficiencyCounter') efficiencyCounter!: ElementRef;
  @ViewChild('safetyScoreCounter') safetyScoreCounter!: ElementRef;
  @ViewChild('vehicleChart') vehicleChart!: ElementRef;
  @ViewChild('energyChart') energyChart!: ElementRef;
  @ViewChild('distanceSparkline') distanceSparkline!: ElementRef;

  selectedMetric = '';
  currentTime = new Date();
  apiResponseTime = 127;

  // Real metrics that will be animated
  fleetMetrics = {
    activeVehicles: 24,
    uptime: 98.5,
    todayDistance: 1247,
    efficiency: 22.8,
    safetyScore: 94
  };

  // Displayed metrics (for animation)
  displayedMetrics = {
    activeVehicles: 0,
    uptime: 0,
    todayDistance: 0,
    efficiency: 0,
    safetyScore: 0
  };

  // Alert system - positive UX focused
  alerts: AlertItem[] = [
    {
      id: 1,
      type: 'success',
      message: 'Vehicle KIA-003 has completed charging and is ready for deployment',
      timestamp: new Date(),
      read: false
    },
    {
      id: 2,
      type: 'success',
      message: 'Fleet efficiency improved by 15% this week - great performance!',
      timestamp: new Date(Date.now() - 300000),
      read: false
    }
  ];

  activeMissions = [
    { id: 'M-001', route: 'Gangnam → Hongdae', progress: 67 },
    { id: 'M-002', route: 'Myeongdong → Incheon', progress: 23 },
    { id: 'M-003', route: 'Seocho → Songpa', progress: 89 }
  ];

  sampleVehicles = [
    { mapX: 15, mapY: 25, status: 'active' },
    { mapX: 35, mapY: 45, status: 'active' },
    { mapX: 65, mapY: 30, status: 'charging' },
    { mapX: 80, mapY: 60, status: 'active' },
    { mapX: 25, mapY: 70, status: 'maintenance' },
    { mapX: 55, mapY: 15, status: 'active' }
  ];

  private updateInterval: any;
  private animationFrameId: any;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only run in browser
    if (isPlatformBrowser(this.platformId)) {
      // Start real-time updates
      this.updateInterval = setInterval(() => {
        this.updateRealTimeData();
      }, 5000);

      // Animate metrics on load
      setTimeout(() => {
        this.animateMetrics();
      }, 100);
    } else {
      // For SSR, just set the final values
      this.displayedMetrics = { ...this.fleetMetrics };
    }
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready - only in browser
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeCharts();
      }, 500);
    }
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.animationFrameId && isPlatformBrowser(this.platformId) && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  get unreadAlerts(): AlertItem[] {
    return this.alerts.filter(alert => !alert.read);
  }

  animateMetrics(): void {
    this.animateValue('activeVehicles', 0, this.fleetMetrics.activeVehicles, 2000);
    this.animateValue('uptime', 0, this.fleetMetrics.uptime, 2500);
    this.animateValue('todayDistance', 0, this.fleetMetrics.todayDistance, 3000);
    this.animateValue('efficiency', 0, this.fleetMetrics.efficiency, 2200);
    this.animateValue('safetyScore', 0, this.fleetMetrics.safetyScore, 2800);
  }

  animateValue(key: keyof typeof this.displayedMetrics, start: number, end: number, duration: number): void {
    // Check if we're in browser and requestAnimationFrame is available
    if (!isPlatformBrowser(this.platformId) || typeof requestAnimationFrame === 'undefined') {
      // Fallback for SSR - just set the final value
      if (key === 'uptime' || key === 'efficiency') {
        this.displayedMetrics[key] = Number(end.toFixed(1));
      } else {
        this.displayedMetrics[key] = end;
      }
      return;
    }

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      if (key === 'uptime' || key === 'efficiency') {
        // Ensure clean decimal formatting for percentages and efficiency
        this.displayedMetrics[key] = Number((start + (end - start) * easeOut).toFixed(1));
      } else {
        this.displayedMetrics[key] = Math.floor(start + (end - start) * easeOut);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  initializeCharts(): void {
    // Only create charts in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      this.createSparklineChart();
      this.createEnergyChart();
      this.createVehicleChart();
    } catch (error) {
      console.warn('Chart initialization failed:', error);
    }
  }

  createSparklineChart(): void {
    if (!this.distanceSparkline?.nativeElement) return;
    
    const ctx = this.distanceSparkline.nativeElement.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', '', ''],
        datasets: [{
          data: [120, 150, 180, 140, 200, 170, 190],
          borderColor: 'var(--kia-live-red)',
          backgroundColor: 'rgba(196, 18, 48, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: { point: { radius: 0 } }
      }
    });
  }

  createEnergyChart(): void {
    if (!this.energyChart?.nativeElement) return;
    
    const ctx = this.energyChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [85, 92, 78, 95, 88, 90, 94],
          backgroundColor: [
            'var(--kia-live-red)',
            'var(--text-secondary)',
            'var(--text-secondary)',
            'var(--text-secondary)',
            'var(--text-secondary)',
            'var(--text-secondary)',
            'var(--kia-live-red)'
          ],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  createVehicleChart(): void {
    if (!this.vehicleChart?.nativeElement) return;
    
    const ctx = this.vehicleChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'now'],
        datasets: [{
          data: [20, 22, 21, 23, 24, 23, 24],
          borderColor: 'var(--kia-live-red)',
          backgroundColor: 'rgba(196, 18, 48, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: { point: { radius: 2 } }
      }
    });
  }

  updateRealTimeData(): void {
    this.currentTime = new Date();
    
    // Simulate slight variations in metrics
    this.fleetMetrics.activeVehicles += Math.floor(Math.random() * 3) - 1;
    this.fleetMetrics.uptime += (Math.random() - 0.5) * 0.1;
    this.fleetMetrics.todayDistance += Math.floor(Math.random() * 20);
    this.apiResponseTime = 120 + Math.floor(Math.random() * 20);
    
    // Update missions progress
    this.activeMissions.forEach(mission => {
      if (mission.progress < 100) {
        mission.progress = Math.min(100, mission.progress + Math.floor(Math.random() * 5));
      }
    });

    // Ensure values stay in reasonable ranges
    this.fleetMetrics.activeVehicles = Math.max(20, Math.min(30, this.fleetMetrics.activeVehicles));
    this.fleetMetrics.uptime = Math.max(95, Math.min(100, Number(this.fleetMetrics.uptime.toFixed(1))));
    
    // Update displayed metrics with proper formatting
    this.displayedMetrics = { 
      ...this.fleetMetrics,
      uptime: Number(this.fleetMetrics.uptime.toFixed(1)),
      efficiency: Number(this.fleetMetrics.efficiency.toFixed(1))
    };
  }

  selectMetric(metric: string): void {
    this.selectedMetric = this.selectedMetric === metric ? '' : metric;
  }

  dismissAlert(alertId: number): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
    }
  }

  // Navigation methods
  navigateToFleet(): void {
    this.router.navigate(['/fleet']);
  }

  navigateToEnergy(): void {
    this.router.navigate(['/energy']);
  }

  navigateToSafety(): void {
    this.router.navigate(['/safety']);
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }

  // Utility methods for UI
  getCircumference(): number {
    return 2 * Math.PI * 25; // radius = 25
  }

  getUptimeOffset(): number {
    const circumference = this.getCircumference();
    return circumference - (this.displayedMetrics.uptime / 100) * circumference;
  }

  getEfficiencyPercentage(): number {
    // Efficiency is better when lower, so we invert the percentage
    return Math.max(0, 100 - (this.displayedMetrics.efficiency - 15) * 4);
  }
} 