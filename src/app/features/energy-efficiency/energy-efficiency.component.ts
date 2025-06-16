import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EnergyData {
  date: string;
  consumption: number;
  cost: number;
  efficiency: number;
}

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
  type: 'fast' | 'standard' | 'ultra-fast';
  power: number;
  currentVehicle?: string;
  utilizationRate: number;
  lastMaintenance: Date;
}

interface BatteryHealthData {
  vehicleId: string;
  model: string;
  batteryCapacity: number;
  currentHealth: number;
  cycleCount: number;
  estimatedLifespan: number;
  lastCheckup: Date;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

@Component({
  selector: 'app-energy-efficiency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="energy-management">
      <!-- Header -->
      <div class="energy-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Energy Management</h1>
            <p class="subtitle">Optimize energy consumption and reduce operational costs</p>
          </div>
          
          <div class="energy-summary">
            <div class="summary-item">
              <span class="value">{{ todayConsumption }} kWh</span>
              <span class="label">Today's Usage</span>
            </div>
            <div class="summary-item">
              <span class="value">{{ monthlyBudget - monthlyCost | number:'1.0-0' }}₩</span>
              <span class="label">Budget Remaining</span>
            </div>
            <div class="summary-item">
              <span class="value">{{ fleetEfficiency }} kWh/100km</span>
              <span class="label">Fleet Average</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Control Tabs -->
      <div class="tab-controls">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'overview'" 
          (click)="setActiveTab('overview')"
        >
          <i class="pi pi-chart-line"></i>
          Overview
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'charging'" 
          (click)="setActiveTab('charging')"
        >
          <i class="pi pi-bolt"></i>
          Charging Stations
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'battery'" 
          (click)="setActiveTab('battery')"
        >
          <i class="pi pi-heart"></i>
          Battery Health
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'analytics'" 
          (click)="setActiveTab('analytics')"
        >
          <i class="pi pi-chart-bar"></i>
          Cost Analytics
        </button>
      </div>

      <!-- Content Sections -->
      <div class="energy-content">
        
        <!-- Overview Tab -->
        <div class="tab-content" *ngIf="activeTab === 'overview'">
          <div class="overview-grid">
            
            <!-- Energy Consumption Chart -->
            <div class="chart-card">
              <div class="card-header">
                <h3>7-Day Energy Consumption</h3>
                <div class="chart-controls">
                  <select [(ngModel)]="chartPeriod" (ngModelChange)="updateChartData()">
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="3m">Last 3 Months</option>
                  </select>
                </div>
              </div>
              <div class="chart-container">
                <div class="mock-chart">
                  <div class="chart-bars">
                    <div 
                      *ngFor="let data of energyHistory; trackBy: trackByDate" 
                      class="chart-bar"
                      [style.height.%]="(data.consumption / maxConsumption) * 100"
                      [title]="data.date + ': ' + data.consumption + ' kWh'"
                    >
                      <div class="bar-value">{{ data.consumption }}</div>
                    </div>
                  </div>
                  <div class="chart-labels">
                    <span *ngFor="let data of energyHistory">{{ getShortDate(data.date) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Efficiency Metrics -->
            <div class="metrics-card">
              <div class="card-header">
                <h3>Efficiency Metrics</h3>
              </div>
              <div class="metrics-grid">
                <div class="metric-item">
                  <div class="metric-icon efficiency">
                    <i class="pi pi-trending-up"></i>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value">{{ fleetEfficiency }}</span>
                    <span class="metric-label">kWh/100km Average</span>
                    <span class="metric-change positive">+8% improvement</span>
                  </div>
                </div>
                
                <div class="metric-item">
                  <div class="metric-icon cost">
                    <i class="pi pi-dollar"></i>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value">{{ costPerKm | number:'1.2-2' }}₩</span>
                    <span class="metric-label">Cost per km</span>
                    <span class="metric-change negative">-12% vs last month</span>
                  </div>
                </div>
                
                <div class="metric-item">
                  <div class="metric-icon carbon">
                    <i class="pi pi-sun"></i>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value">{{ carbonSaved }} kg</span>
                    <span class="metric-label">CO₂ Saved This Month</span>
                    <span class="metric-change positive">vs ICE vehicles</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Real-time Energy Flow -->
            <div class="energy-flow-card">
              <div class="card-header">
                <h3>Real-time Energy Flow</h3>
              </div>
              <div class="energy-flow">
                <div class="flow-item">
                  <div class="flow-icon grid">
                    <i class="pi pi-bolt"></i>
                  </div>
                  <div class="flow-content">
                    <span class="flow-value">{{ gridInput }} kW</span>
                    <span class="flow-label">Grid Input</span>
                  </div>
                </div>
                
                <div class="flow-arrow">
                  <i class="pi pi-arrow-right"></i>
                </div>
                
                <div class="flow-item">
                  <div class="flow-icon charging">
                    <i class="pi pi-car"></i>
                  </div>
                  <div class="flow-content">
                    <span class="flow-value">{{ chargingPower }} kW</span>
                    <span class="flow-label">Charging Fleet</span>
                  </div>
                </div>
                
                <div class="flow-arrow">
                  <i class="pi pi-arrow-right"></i>
                </div>
                
                <div class="flow-item">
                  <div class="flow-icon storage">
                    <i class="pi pi-database"></i>
                  </div>
                  <div class="flow-content">
                    <span class="flow-value">{{ storagePower }} kW</span>
                    <span class="flow-label">Battery Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charging Stations Tab -->
        <div class="tab-content" *ngIf="activeTab === 'charging'">
          <div class="charging-grid">
            
            <!-- Station Status Overview -->
            <div class="status-overview">
              <div class="status-card available">
                <div class="status-icon">
                  <i class="pi pi-check-circle"></i>
                </div>
                <div class="status-content">
                  <span class="status-count">{{ getStationsByStatus('available').length }}</span>
                  <span class="status-label">Available</span>
                </div>
              </div>
              
              <div class="status-card occupied">
                <div class="status-icon">
                  <i class="pi pi-car"></i>
                </div>
                <div class="status-content">
                  <span class="status-count">{{ getStationsByStatus('occupied').length }}</span>
                  <span class="status-label">In Use</span>
                </div>
              </div>
              
              <div class="status-card maintenance">
                <div class="status-icon">
                  <i class="pi pi-wrench"></i>
                </div>
                <div class="status-content">
                  <span class="status-count">{{ getStationsByStatus('maintenance').length }}</span>
                  <span class="status-label">Maintenance</span>
                </div>
              </div>
            </div>

            <!-- Charging Stations List -->
            <div class="stations-list">
              <div class="list-header">
                <h3>Charging Stations</h3>
                <div class="list-controls">
                  <select [(ngModel)]="stationFilter" (ngModelChange)="filterStations()">
                    <option value="all">All Stations</option>
                    <option value="available">Available Only</option>
                    <option value="occupied">In Use</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div class="stations-grid">
                <div 
                  *ngFor="let station of filteredStations; trackBy: trackByStationId" 
                  class="station-card"
                  [class]="'station--' + station.status"
                >
                  <div class="station-header">
                    <div class="station-info">
                      <h4>{{ station.name }}</h4>
                      <span class="station-location">{{ station.location }}</span>
                    </div>
                    <div class="station-status" [class]="'status--' + station.status">
                      <i class="pi" [class]="getStationIcon(station.status)"></i>
                      <span>{{ station.status | titlecase }}</span>
                    </div>
                  </div>
                  
                  <div class="station-details">
                    <div class="detail-row">
                      <span class="detail-label">Type:</span>
                      <span class="detail-value">{{ station.type | titlecase }} ({{ station.power }}kW)</span>
                    </div>
                    <div class="detail-row" *ngIf="station.currentVehicle">
                      <span class="detail-label">Vehicle:</span>
                      <span class="detail-value">{{ station.currentVehicle }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Utilization:</span>
                      <span class="detail-value">{{ station.utilizationRate }}%</span>
                    </div>
                  </div>
                  
                  <div class="utilization-bar">
                    <div 
                      class="utilization-fill" 
                      [style.width.%]="station.utilizationRate"
                      [class]="getUtilizationClass(station.utilizationRate)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Battery Health Tab -->
        <div class="tab-content" *ngIf="activeTab === 'battery'">
          <div class="battery-health-content">
            
            <!-- Fleet Battery Overview -->
            <div class="battery-overview">
              <div class="overview-card">
                <h3>Fleet Battery Health</h3>
                <div class="health-distribution">
                  <div class="health-item excellent">
                    <span class="health-count">{{ getBatteryByHealth('excellent').length }}</span>
                    <span class="health-label">Excellent</span>
                  </div>
                  <div class="health-item good">
                    <span class="health-count">{{ getBatteryByHealth('good').length }}</span>
                    <span class="health-label">Good</span>
                  </div>
                  <div class="health-item fair">
                    <span class="health-count">{{ getBatteryByHealth('fair').length }}</span>
                    <span class="health-label">Fair</span>
                  </div>
                  <div class="health-item poor">
                    <span class="health-count">{{ getBatteryByHealth('poor').length }}</span>
                    <span class="health-label">Poor</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Battery Health List -->
            <div class="battery-list">
              <div class="list-header">
                <h3>Individual Battery Status</h3>
                <select [(ngModel)]="batteryFilter" (ngModelChange)="filterBatteries()">
                  <option value="all">All Vehicles</option>
                  <option value="excellent">Excellent Health</option>
                  <option value="good">Good Health</option>
                  <option value="fair">Fair Health</option>
                  <option value="poor">Poor Health</option>
                </select>
              </div>
              
              <div class="battery-grid">
                <div 
                  *ngFor="let battery of filteredBatteries; trackBy: trackByBatteryId" 
                  class="battery-card"
                  [class]="'battery--' + battery.status"
                >
                  <div class="battery-header">
                    <div class="battery-info">
                      <h4>{{ battery.model }}</h4>
                      <span class="vehicle-id">{{ battery.vehicleId }}</span>
                    </div>
                    <div class="health-badge" [class]="'health--' + battery.status">
                      {{ battery.currentHealth }}%
                    </div>
                  </div>
                  
                  <div class="battery-metrics">
                    <div class="metric-row">
                      <span class="metric-label">Capacity:</span>
                      <span class="metric-value">{{ battery.batteryCapacity }} kWh</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">Cycles:</span>
                      <span class="metric-value">{{ battery.cycleCount | number }}</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">Est. Lifespan:</span>
                      <span class="metric-value">{{ battery.estimatedLifespan }} years</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">Last Check:</span>
                      <span class="metric-value">{{ getTimeAgo(battery.lastCheckup) }}</span>
                    </div>
                  </div>
                  
                  <div class="health-progress">
                    <div 
                      class="health-bar" 
                      [style.width.%]="battery.currentHealth"
                      [class]="'health--' + battery.status"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cost Analytics Tab -->
        <div class="tab-content" *ngIf="activeTab === 'analytics'">
          <div class="analytics-content">
            
            <!-- Cost Breakdown -->
            <div class="cost-breakdown">
              <div class="breakdown-card">
                <h3>Monthly Cost Breakdown</h3>
                <div class="cost-items">
                  <div class="cost-item">
                    <div class="cost-icon energy">
                      <i class="pi pi-bolt"></i>
                    </div>
                    <div class="cost-content">
                      <span class="cost-label">Energy Consumption</span>
                      <span class="cost-value">{{ energyCost | number }}₩</span>
                      <span class="cost-percentage">{{ (energyCost / totalCost * 100) | number:'1.0-0' }}%</span>
                    </div>
                  </div>
                  
                  <div class="cost-item">
                    <div class="cost-icon maintenance">
                      <i class="pi pi-wrench"></i>
                    </div>
                    <div class="cost-content">
                      <span class="cost-label">Maintenance</span>
                      <span class="cost-value">{{ maintenanceCost | number }}₩</span>
                      <span class="cost-percentage">{{ (maintenanceCost / totalCost * 100) | number:'1.0-0' }}%</span>
                    </div>
                  </div>
                  
                  <div class="cost-item">
                    <div class="cost-icon infrastructure">
                      <i class="pi pi-building"></i>
                    </div>
                    <div class="cost-content">
                      <span class="cost-label">Infrastructure</span>
                      <span class="cost-value">{{ infrastructureCost | number }}₩</span>
                      <span class="cost-percentage">{{ (infrastructureCost / totalCost * 100) | number:'1.0-0' }}%</span>
                    </div>
                  </div>
                </div>
                
                <div class="total-cost">
                  <span class="total-label">Total Monthly Cost</span>
                  <span class="total-value">{{ totalCost | number }}₩</span>
                </div>
              </div>
            </div>

            <!-- Savings Projection -->
            <div class="savings-projection">
              <div class="projection-card">
                <h3>Annual Savings vs ICE Fleet</h3>
                <div class="savings-content">
                  <div class="savings-item">
                    <span class="savings-label">Fuel Cost Savings</span>
                    <span class="savings-value positive">{{ fuelSavings | number }}₩</span>
                  </div>
                  <div class="savings-item">
                    <span class="savings-label">Maintenance Savings</span>
                    <span class="savings-value positive">{{ maintenanceSavings | number }}₩</span>
                  </div>
                  <div class="savings-item">
                    <span class="savings-label">Tax Incentives</span>
                    <span class="savings-value positive">{{ taxIncentives | number }}₩</span>
                  </div>
                  <div class="savings-total">
                    <span class="total-savings-label">Total Annual Savings</span>
                    <span class="total-savings-value">{{ totalSavings | number }}₩</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styleUrls: ['./energy-efficiency.component.scss']
})
export class EnergyEfficiencyComponent implements OnInit, OnDestroy {
  activeTab: 'overview' | 'charging' | 'battery' | 'analytics' = 'overview';
  
  // Overview data
  todayConsumption = 1247;
  monthlyBudget = 2500000;
  monthlyCost = 1850000;
  fleetEfficiency = 22.8;
  costPerKm = 45.5;
  carbonSaved = 2140;
  gridInput = 145;
  chargingPower = 89;
  storagePower = 56;
  
  chartPeriod = '7d';
  energyHistory: EnergyData[] = [];
  maxConsumption = 0;
  
  // Charging station data
  chargingStations: ChargingStation[] = [];
  filteredStations: ChargingStation[] = [];
  stationFilter = 'all';
  
  // Battery health data
  batteryHealthData: BatteryHealthData[] = [];
  filteredBatteries: BatteryHealthData[] = [];
  batteryFilter = 'all';
  
  // Cost analytics
  energyCost = 1200000;
  maintenanceCost = 450000;
  infrastructureCost = 200000;
  totalCost = 1850000;
  fuelSavings = 8500000;
  maintenanceSavings = 3200000;
  taxIncentives = 1800000;
  totalSavings = 13500000;
  
  private updateInterval: any;

  ngOnInit(): void {
    this.generateEnergyHistory();
    this.generateChargingStations();
    this.generateBatteryHealthData();
    
    // Simulate real-time updates
    this.updateInterval = setInterval(() => {
      this.updateRealTimeData();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  setActiveTab(tab: 'overview' | 'charging' | 'battery' | 'analytics'): void {
    this.activeTab = tab;
  }

  trackByDate(index: number, item: EnergyData): string {
    return item.date;
  }

  trackByStationId(index: number, item: ChargingStation): string {
    return item.id;
  }

  trackByBatteryId(index: number, item: BatteryHealthData): string {
    return item.vehicleId;
  }

  generateEnergyHistory(): void {
    const days = this.chartPeriod === '7d' ? 7 : this.chartPeriod === '30d' ? 30 : 90;
    this.energyHistory = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const consumption = Math.floor(Math.random() * 500) + 800;
      
      return {
        date: date.toISOString().split('T')[0],
        consumption,
        cost: consumption * 180,
        efficiency: Math.random() * 5 + 20
      };
    });
    
    this.maxConsumption = Math.max(...this.energyHistory.map(d => d.consumption));
  }

  updateChartData(): void {
    this.generateEnergyHistory();
  }

  getShortDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  generateChargingStations(): void {
    const stationNames = [
      'Seoul Station Hub',
      'Gangnam Center',
      'Hongdae Plaza',
      'Itaewon Point',
      'Jamsil Complex',
      'Myeongdong Station',
      'Dongdaemun Hub',
      'Yeouido Center'
    ];
    
    this.chargingStations = Array.from({ length: 12 }, (_, i) => ({
      id: `CS-${String(i + 1).padStart(3, '0')}`,
      name: stationNames[i % stationNames.length],
      location: `Seoul District ${i + 1}`,
      status: this.getRandomStationStatus(),
      type: ['fast', 'standard', 'ultra-fast'][Math.floor(Math.random() * 3)] as any,
      power: [50, 100, 150, 250][Math.floor(Math.random() * 4)],
      currentVehicle: Math.random() > 0.6 ? `KIA-${String(Math.floor(Math.random() * 18) + 1).padStart(3, '0')}` : undefined,
      utilizationRate: Math.floor(Math.random() * 100),
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }));
    
    this.filteredStations = [...this.chargingStations];
  }

  generateBatteryHealthData(): void {
    const models = ['PV5', 'PV7', 'Ray EV', 'Bongo III EV'];
    
    this.batteryHealthData = Array.from({ length: 18 }, (_, i) => ({
      vehicleId: `KIA-${String(i + 1).padStart(3, '0')}`,
      model: models[Math.floor(Math.random() * models.length)],
      batteryCapacity: [64, 77.4, 91.2][Math.floor(Math.random() * 3)],
      currentHealth: Math.floor(Math.random() * 30) + 70,
      cycleCount: Math.floor(Math.random() * 1000) + 100,
      estimatedLifespan: Math.floor(Math.random() * 3) + 8,
      lastCheckup: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      status: this.getRandomBatteryHealth()
    }));
    
    this.filteredBatteries = [...this.batteryHealthData];
  }

  getRandomStationStatus(): ChargingStation['status'] {
    const statuses: ChargingStation['status'][] = ['available', 'occupied', 'maintenance', 'offline'];
    const weights = [0.5, 0.3, 0.15, 0.05];
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return statuses[i];
      }
    }
    return 'available';
  }

  getRandomBatteryHealth(): BatteryHealthData['status'] {
    const statuses: BatteryHealthData['status'][] = ['excellent', 'good', 'fair', 'poor'];
    const weights = [0.4, 0.4, 0.15, 0.05];
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return statuses[i];
      }
    }
    return 'good';
  }

  getStationsByStatus(status: string): ChargingStation[] {
    return this.chargingStations.filter(s => s.status === status);
  }

  getBatteryByHealth(health: string): BatteryHealthData[] {
    return this.batteryHealthData.filter(b => b.status === health);
  }

  filterStations(): void {
    if (this.stationFilter === 'all') {
      this.filteredStations = [...this.chargingStations];
    } else {
      this.filteredStations = this.chargingStations.filter(s => s.status === this.stationFilter);
    }
  }

  filterBatteries(): void {
    if (this.batteryFilter === 'all') {
      this.filteredBatteries = [...this.batteryHealthData];
    } else {
      this.filteredBatteries = this.batteryHealthData.filter(b => b.status === this.batteryFilter);
    }
  }

  getStationIcon(status: string): string {
    const icons = {
      available: 'pi-check-circle',
      occupied: 'pi-car',
      maintenance: 'pi-wrench',
      offline: 'pi-times-circle'
    };
    return icons[status as keyof typeof icons] || 'pi-circle';
  }

  getUtilizationClass(rate: number): string {
    if (rate > 80) return 'high';
    if (rate > 50) return 'medium';
    return 'low';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  }

  updateRealTimeData(): void {
    // Simulate real-time energy flow updates
    this.gridInput = Math.floor(Math.random() * 50) + 120;
    this.chargingPower = Math.floor(Math.random() * 40) + 70;
    this.storagePower = Math.floor(Math.random() * 30) + 40;
    
    // Update utilization rates
    this.chargingStations.forEach(station => {
      if (station.status === 'occupied') {
        station.utilizationRate = Math.min(100, station.utilizationRate + Math.random() * 5);
      }
    });
  }
} 