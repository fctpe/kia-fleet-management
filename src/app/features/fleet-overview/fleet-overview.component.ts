import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Vehicle {
  id: string;
  model: string;
  type: 'delivery' | 'passenger' | 'cargo' | 'maintenance';
  status: 'active' | 'charging' | 'maintenance' | 'offline' | 'parked';
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };
  battery: number;
  driver?: string;
  lastUpdate: Date;
  odometer: number;
  efficiency: number;
  nextMaintenance: number;
  route?: string;
  speed: number;
}

@Component({
  selector: 'app-fleet-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fleet-overview">
      <!-- Simplified Header -->
      <div class="fleet-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Fleet Overview</h1>
            <p class="fleet-count">{{ vehicles.length }} vehicles • {{ getVehiclesByStatus('active').length }} active</p>
          </div>
          
          <!-- Quick Status Summary - Inline -->
          <div class="status-summary">
            <div class="status-item active">
              <span class="count">{{ getVehiclesByStatus('active').length }}</span>
              <span class="label">Active</span>
            </div>
            <div class="status-item charging">
              <span class="count">{{ getVehiclesByStatus('charging').length }}</span>
              <span class="label">Charging</span>
            </div>
            <div class="status-item maintenance">
              <span class="count">{{ getVehiclesByStatus('maintenance').length }}</span>
              <span class="label">Maintenance</span>
            </div>
            <div class="status-item parked">
              <span class="count">{{ getVehiclesByStatus('parked').length }}</span>
              <span class="label">Parked</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Section -->
      <div class="controls-section">
        <div class="view-controls">
          <button class="btn btn--tertiary" [class.active]="viewMode === 'list'" (click)="setViewMode('list')">
            <i class="pi pi-list"></i>
            List View
          </button>
          <button class="btn btn--tertiary" [class.active]="viewMode === 'map'" (click)="setViewMode('map')">
            <i class="pi pi-map"></i>
            Map View
          </button>
        </div>
        
        <div class="search-controls">
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              [(ngModel)]="searchTerm"
              (ngModelChange)="filterVehicles()"
            />
          </div>
          
          <select [(ngModel)]="selectedFilter" (ngModelChange)="filterVehicles()" class="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="charging">Charging</option>
            <option value="maintenance">Maintenance</option>
            <option value="parked">Parked</option>
          </select>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Improved List View -->
        <div class="vehicle-list" *ngIf="viewMode === 'list'">
          <div class="list-container">
            <div 
              *ngFor="let vehicle of filteredVehicles; trackBy: trackByVehicleId" 
              class="vehicle-card"
              [class.selected]="selectedVehicle?.id === vehicle.id"
              (click)="selectVehicle(vehicle)"
            >
              <!-- Vehicle Header -->
              <div class="vehicle-header">
                <div class="vehicle-identity">
                  <h3>{{ vehicle.model }}</h3>
                  <span class="vehicle-id">{{ vehicle.id }}</span>
                </div>
                
                <div class="status-badge" [class]="'status--' + vehicle.status">
                  <i class="pi" [class]="getStatusIcon(vehicle.status)"></i>
                  <span>{{ vehicle.status | titlecase }}</span>
                </div>
              </div>
              
              <!-- Vehicle Info Grid -->
              <div class="vehicle-info-grid">
                <div class="info-item">
                  <span class="info-label">Location</span>
                  <span class="info-value">{{ vehicle.location.city }}</span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">Battery</span>
                  <span class="info-value battery">{{ vehicle.battery }}%</span>
                </div>
                
                <div class="info-item" *ngIf="vehicle.driver">
                  <span class="info-label">Driver</span>
                  <span class="info-value">{{ vehicle.driver }}</span>
                </div>
                
                <div class="info-item" *ngIf="!vehicle.driver">
                  <span class="info-label">Type</span>
                  <span class="info-value">{{ vehicle.type | titlecase }}</span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">Updated</span>
                  <span class="info-value">{{ getTimeAgo(vehicle.lastUpdate) }}</span>
                </div>
                
                <div class="info-item" *ngIf="vehicle.status === 'active'">
                  <span class="info-label">Speed</span>
                  <span class="info-value speed">{{ vehicle.speed }} km/h</span>
                </div>
              </div>
              
              <!-- Battery Progress Bar -->
              <div class="battery-progress">
                <div class="battery-bar" [style.width.%]="vehicle.battery" [class]="getBatteryClass(vehicle.battery)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map View with Seoul Background -->
        <div class="map-view" *ngIf="viewMode === 'map'">
          <div class="interactive-map">
            <div class="map-container">
              <div class="seoul-map-bg"></div>
              
              <div class="map-overlay">
                <div class="city-label">Seoul, South Korea</div>
              </div>
              
              <!-- Vehicle Markers -->
              <div 
                *ngFor="let vehicle of vehicles; trackBy: trackByVehicleId" 
                class="vehicle-marker" 
                [class]="'vehicle-marker--' + vehicle.status"
                [style.left.%]="vehicle.location.lat" 
                [style.top.%]="vehicle.location.lng"
                (click)="selectVehicle(vehicle)"
                [title]="vehicle.model + ' - ' + vehicle.status"
              >
                <div class="marker-icon">
                  <i class="pi pi-circle-fill"></i>
                </div>
                <div class="marker-pulse" [class.active]="vehicle.status === 'active'"></div>
              </div>
            </div>
            
            <!-- Map Legend -->
            <div class="map-legend">
              <div class="legend-item">
                <span class="legend-dot active"></span>
                <span>Active</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot charging"></span>
                <span>Charging</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot maintenance"></span>
                <span>Maintenance</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot parked"></span>
                <span>Parked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicle Detail Panel -->
      <div class="vehicle-detail-panel" *ngIf="selectedVehicle">
        <div class="panel-header">
          <h3>{{ selectedVehicle.model }}</h3>
          <button class="close-btn" (click)="selectedVehicle = null">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="panel-content">
          <div class="detail-section">
            <h4>Status</h4>
            <div class="status-badge large" [class]="'status--' + selectedVehicle.status">
              <i class="pi" [class]="getStatusIcon(selectedVehicle.status)"></i>
              {{ selectedVehicle.status | titlecase }}
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Vehicle Information</h4>
            <div class="info-list">
              <div class="info-item">
                <span class="label">Model:</span>
                <span class="value">{{ selectedVehicle.model }}</span>
              </div>
              <div class="info-item">
                <span class="label">Type:</span>
                <span class="value">{{ selectedVehicle.type | titlecase }}</span>
              </div>
              <div class="info-item">
                <span class="label">Odometer:</span>
                <span class="value">{{ selectedVehicle.odometer.toLocaleString() }} km</span>
              </div>
              <div class="info-item">
                <span class="label">Efficiency:</span>
                <span class="value">{{ selectedVehicle.efficiency }} kWh/100km</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Location</h4>
            <div class="location-info">
              <p>{{ selectedVehicle.location.address }}</p>
              <p>{{ selectedVehicle.location.city }}</p>
            </div>
          </div>
          
          <div class="detail-section" *ngIf="selectedVehicle.status === 'active'">
            <h4>Live Data</h4>
            <div class="live-stats">
              <div class="stat-item">
                <span class="stat-value">{{ selectedVehicle.speed }}</span>
                <span class="stat-label">km/h</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ selectedVehicle.battery }}</span>
                <span class="stat-label">% battery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./fleet-overview.component.scss']
})
export class FleetOverviewComponent implements OnInit, OnDestroy {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  selectedVehicle: Vehicle | null = null;
  viewMode: 'list' | 'map' = 'list';
  searchTerm = '';
  selectedFilter = 'all';
  private updateInterval: any;

  ngOnInit(): void {
    this.generateMockVehicles();
    this.filteredVehicles = [...this.vehicles];
    
    this.updateInterval = setInterval(() => {
      this.simulateVehicleUpdates();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  trackByVehicleId(index: number, vehicle: Vehicle): string {
    return vehicle.id;
  }

  generateMockVehicles(): void {
    const vehicleModels = ['PV5', 'PV7', 'Ray EV', 'Bongo III EV'];
    const locations = [
      { city: 'Gangnam-gu', address: '123 Teheran-ro' },
      { city: 'Jung-gu', address: '456 Myeong-dong' },
      { city: 'Songpa-gu', address: '789 Olympic-ro' },
      { city: 'Mapo-gu', address: '321 Hongik-ro' },
      { city: 'Seocho-gu', address: '654 Seocho-daero' },
      { city: 'Yongsan-gu', address: '987 Itaewon-ro' }
    ];
    const drivers = ['Kim Min-jun', 'Lee So-young', 'Park Ji-hoon', 'Choi Su-bin', 'Jung Hae-won'];
    
    this.vehicles = Array.from({ length: 18 }, (_, i) => ({
      id: `KIA-${String(i + 1).padStart(3, '0')}`,
      model: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
      type: ['delivery', 'passenger', 'cargo', 'maintenance'][Math.floor(Math.random() * 4)] as any,
      status: this.getRandomStatus(),
      location: {
        lat: Math.random() * 80 + 10,
        lng: Math.random() * 80 + 10,
        ...locations[Math.floor(Math.random() * locations.length)]
      },
      battery: Math.floor(Math.random() * 100) + 1,
      driver: Math.random() > 0.3 ? drivers[Math.floor(Math.random() * drivers.length)] : undefined,
      lastUpdate: new Date(Date.now() - Math.random() * 3600000),
      odometer: Math.floor(Math.random() * 50000) + 5000,
      efficiency: Math.floor(Math.random() * 10) + 20,
      nextMaintenance: Math.floor(Math.random() * 5000) + 1000,
      route: Math.random() > 0.5 ? ['Route A', 'Route B', 'Route C'][Math.floor(Math.random() * 3)] : undefined,
      speed: Math.floor(Math.random() * 60)
    }));
  }

  getRandomStatus(): Vehicle['status'] {
    const statuses: Vehicle['status'][] = ['active', 'charging', 'maintenance', 'parked'];
    const weights = [0.4, 0.2, 0.1, 0.3];
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return statuses[i];
      }
    }
    return 'parked';
  }

  getVehiclesByStatus(status: string): Vehicle[] {
    return this.vehicles.filter(v => v.status === status);
  }

  setViewMode(mode: 'list' | 'map'): void {
    this.viewMode = mode;
  }

  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;
  }

  filterVehicles(): void {
    let filtered = [...this.vehicles];
    
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(v => v.status === this.selectedFilter);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.id.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.location.city.toLowerCase().includes(term) ||
        (v.driver && v.driver.toLowerCase().includes(term))
      );
    }
    
    this.filteredVehicles = filtered;
  }

  getStatusIcon(status: string): string {
    const icons = {
      active: 'pi-play-circle',
      charging: 'pi-bolt',
      maintenance: 'pi-wrench',
      offline: 'pi-exclamation-triangle',
      parked: 'pi-pause-circle'
    };
    return icons[status as keyof typeof icons] || 'pi-circle';
  }

  getBatteryClass(battery: number): string {
    if (battery > 60) return 'high';
    if (battery > 30) return 'medium';
    return 'low';
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

  simulateVehicleUpdates(): void {
    const vehiclesToUpdate = this.vehicles.filter(() => Math.random() > 0.9);
    
    vehiclesToUpdate.forEach(vehicle => {
      if (vehicle.status === 'active') {
        vehicle.location.lat += (Math.random() - 0.5) * 1;
        vehicle.location.lng += (Math.random() - 0.5) * 1;
        
        vehicle.location.lat = Math.max(10, Math.min(90, vehicle.location.lat));
        vehicle.location.lng = Math.max(10, Math.min(90, vehicle.location.lng));
        
        vehicle.speed = Math.floor(Math.random() * 60);
        // Round battery to whole number to avoid long decimals
        vehicle.battery = Math.max(1, Math.round(vehicle.battery - Math.random()));
      }
      
      vehicle.lastUpdate = new Date();
    });
  }
} 