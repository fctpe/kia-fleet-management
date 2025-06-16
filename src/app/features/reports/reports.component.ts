import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportTemplate {
  id: string;
  name: string;
  category: 'fleet' | 'safety' | 'energy' | 'maintenance' | 'driver' | 'financial';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  dataPoints: string[];
  icon: string;
  estimatedTime: string;
  isPopular: boolean;
  lastGenerated?: Date;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  category: string;
  generatedDate: Date;
  dateRange: {
    from: Date;
    to: Date;
  };
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  fileSize: string;
  downloadUrl?: string;
  format: 'pdf' | 'excel' | 'csv';
}

interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: Date;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
}

interface ReportMetrics {
  totalReports: number;
  reportsThisMonth: number;
  scheduledReports: number;
  averageGenerationTime: string;
  mostPopularCategory: string;
  dataRetentionDays: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page">
      <!-- Clean Header -->
      <div class="reports-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Reports & Analytics</h1>
            <p class="reports-subtitle">{{ reportTemplates.length }} templates • {{ reportMetrics.reportsThisMonth }} generated this month</p>
          </div>
          
          <!-- Quick Metrics Summary -->
          <div class="metrics-summary">
            <div class="metric-item">
              <span class="metric-value">{{ reportMetrics.totalReports }}</span>
              <span class="metric-label">Total</span>
            </div>
            <div class="metric-item">
              <span class="metric-value">{{ reportMetrics.scheduledReports }}</span>
              <span class="metric-label">Scheduled</span>
            </div>
            <div class="metric-item">
              <span class="metric-value">{{ reportMetrics.averageGenerationTime }}</span>
              <span class="metric-label">Avg. Time</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Section -->
      <div class="controls-section">
        <div class="view-controls">
          <button 
            *ngFor="let tab of navigationTabs" 
            class="btn btn--tertiary"
            [class.active]="activeTab === tab.id"
            (click)="setActiveTab(tab.id)"
          >
            <i class="pi" [class]="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>
        
        <div class="search-controls">
          <!-- Templates Tab Controls -->
          <div *ngIf="activeTab === 'templates'" class="tab-controls">
            <div class="search-box">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                placeholder="Search templates..." 
                [(ngModel)]="searchTerm"
                (ngModelChange)="filterTemplates()"
              />
            </div>
            
            <select [(ngModel)]="selectedCategory" (ngModelChange)="filterTemplates()" class="filter-select">
              <option value="all">All Categories</option>
              <option value="fleet">Fleet</option>
              <option value="safety">Safety</option>
              <option value="energy">Energy</option>
              <option value="maintenance">Maintenance</option>
              <option value="driver">Driver</option>
              <option value="financial">Financial</option>
            </select>
          </div>

          <!-- History Tab Controls -->
          <div *ngIf="activeTab === 'history'" class="tab-controls">
            <select [(ngModel)]="historyFilter" (ngModelChange)="filterHistory()" class="filter-select">
              <option value="all">All Reports</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="generating">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Report Templates Tab -->
        <div class="templates-content" *ngIf="activeTab === 'templates'">
          <div class="templates-grid">
            <div 
              *ngFor="let template of filteredTemplates; trackBy: trackByTemplateId" 
              class="template-card"
              (click)="selectTemplate(template)"
            >
              <div class="template-header">
                <div class="template-icon">
                  <i class="pi" [class]="template.icon"></i>
                </div>
                <div class="template-meta">
                  <h3>{{ template.name }}</h3>
                  <span class="template-category">{{ template.category | titlecase }}</span>
                </div>
              </div>
              
              <div class="template-content">
                <p class="template-description">{{ template.description }}</p>
                
                <div class="template-stats">
                  <div class="stat-item">
                    <i class="pi pi-clock"></i>
                    <span>{{ template.estimatedTime }}</span>
                  </div>
                  <div class="stat-item">
                    <i class="pi pi-calendar"></i>
                    <span>{{ template.frequency | titlecase }}</span>
                  </div>
                  <div class="stat-item" *ngIf="template.lastGenerated">
                    <i class="pi pi-history"></i>
                    <span>{{ getTimeAgo(template.lastGenerated) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="template-actions">
                <button class="btn btn--primary" (click)="generateReport(template); $event.stopPropagation()">
                  <i class="pi pi-play"></i>
                  Generate
                </button>
                <button class="btn btn--tertiary" (click)="scheduleReport(template); $event.stopPropagation()">
                  <i class="pi pi-calendar-plus"></i>
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Report History Tab -->
        <div class="history-content" *ngIf="activeTab === 'history'">
          <div class="reports-list">
            <div 
              *ngFor="let report of filteredHistory; trackBy: trackByReportId" 
              class="report-card"
              [class]="'status--' + report.status"
            >
              <div class="report-header">
                <div class="report-icon">
                  <i class="pi" [class]="getReportFormatIcon(report.format)"></i>
                </div>
                <div class="report-meta">
                  <h3>{{ report.name }}</h3>
                  <span class="report-date">{{ report.generatedDate | date:'medium' }}</span>
                </div>
                <div class="report-status">
                  <span class="status-badge" [class]="'status--' + report.status">
                    <i class="pi" [class]="getStatusIcon(report.status)"></i>
                    {{ report.status | titlecase }}
                  </span>
                </div>
              </div>
              
              <div class="report-details">
                <div class="detail-item">
                  <span class="label">Date Range:</span>
                  <span class="value">{{ report.dateRange.from | date:'short' }} - {{ report.dateRange.to | date:'short' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">File Size:</span>
                  <span class="value">{{ report.fileSize }}</span>
                </div>
              </div>
              
              <div class="report-actions">
                <button 
                  *ngIf="report.status === 'completed'" 
                  class="btn btn--primary btn--small" 
                  (click)="downloadReport(report)"
                >
                  <i class="pi pi-download"></i>
                  Download
                </button>
                <button class="btn btn--tertiary btn--small" (click)="regenerateReport(report)">
                  <i class="pi pi-refresh"></i>
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Scheduled Reports Tab -->
        <div class="scheduled-content" *ngIf="activeTab === 'scheduled'">
          <div class="scheduled-list">
            <div 
              *ngFor="let scheduled of scheduledReports; trackBy: trackByScheduledId" 
              class="scheduled-card"
              [class.inactive]="!scheduled.isActive"
            >
              <div class="scheduled-header">
                <div class="scheduled-meta">
                  <h3>{{ scheduled.name }}</h3>
                  <div class="scheduled-details">
                    <span class="frequency">{{ scheduled.frequency | titlecase }}</span>
                    <span class="next-run">Next: {{ scheduled.nextRun | date:'short' }}</span>
                    <span class="recipients">{{ scheduled.recipients.length }} recipients</span>
                  </div>
                </div>
                <div class="scheduled-status">
                  <span class="status-indicator" [class.active]="scheduled.isActive">
                    <i class="pi" [class.pi-pause]="scheduled.isActive" [class.pi-play]="!scheduled.isActive"></i>
                    {{ scheduled.isActive ? 'Active' : 'Paused' }}
                  </span>
                </div>
              </div>
              
              <div class="scheduled-actions">
                <button class="btn btn--tertiary btn--small" (click)="toggleSchedule(scheduled.id)">
                  <i class="pi" [class.pi-pause]="scheduled.isActive" [class.pi-play]="!scheduled.isActive"></i>
                  {{ scheduled.isActive ? 'Pause' : 'Resume' }}
                </button>
                <button class="btn btn--tertiary btn--small" (click)="editSchedule(scheduled.id)">
                  <i class="pi pi-pencil"></i>
                  Edit
                </button>
                <button class="btn btn--tertiary btn--small" (click)="deleteSchedule(scheduled.id)">
                  <i class="pi pi-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" *ngIf="activeTab === 'templates'">
        <button class="btn btn--primary" (click)="showCustomReportBuilder = true">
          <i class="pi pi-plus"></i>
          Create Custom Report
        </button>
      </div>

      <!-- Custom Report Builder Modal -->
      <div class="modal-overlay" *ngIf="showCustomReportBuilder" (click)="showCustomReportBuilder = false">
        <div class="custom-builder" (click)="$event.stopPropagation()">
          <div class="builder-header">
            <h2>Custom Report Builder</h2>
            <button class="close-btn" (click)="showCustomReportBuilder = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
          
          <div class="builder-content">
            <div class="form-section">
              <h3>Report Configuration</h3>
              <div class="form-group">
                <label>Report Name</label>
                <input type="text" [(ngModel)]="customReport.name" placeholder="Enter report name">
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>From Date</label>
                  <input type="date" [(ngModel)]="customReport.dateFrom">
                </div>
                <div class="form-group">
                  <label>To Date</label>
                  <input type="date" [(ngModel)]="customReport.dateTo">
                </div>
              </div>

              <div class="form-group">
                <label>Export Format</label>
                <select [(ngModel)]="customReport.format">
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV Data</option>
                </select>
              </div>
            </div>

            <div class="form-section">
              <h3>Data Sources</h3>
              <div class="data-sources">
                <div 
                  *ngFor="let source of dataSources" 
                  class="source-item"
                  [class.selected]="isSourceSelected(source.id)"
                  (click)="toggleDataSource(source.id)"
                >
                  <div class="source-checkbox">
                    <i class="pi" [class.pi-check-square]="isSourceSelected(source.id)" [class.pi-square]="!isSourceSelected(source.id)"></i>
                  </div>
                  <div class="source-info">
                    <span class="source-name">{{ source.name }}</span>
                    <span class="source-description">{{ source.description }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="builder-actions">
              <button class="btn btn--primary" (click)="generateCustomReport()">
                <i class="pi pi-play"></i>
                Generate Report
              </button>
              <button class="btn btn--secondary" (click)="saveTemplate()">
                <i class="pi pi-save"></i>
                Save as Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  reportTemplates: ReportTemplate[] = [];
  filteredTemplates: ReportTemplate[] = [];
  generatedReports: GeneratedReport[] = [];
  scheduledReports: ScheduledReport[] = [];
  filteredHistory: GeneratedReport[] = [];
  
  reportMetrics: ReportMetrics = {
    totalReports: 156,
    reportsThisMonth: 23,
    scheduledReports: 8,
    averageGenerationTime: '2.3min',
    mostPopularCategory: 'fleet',
    dataRetentionDays: 90
  };

  navigationTabs = [
    { id: 'templates', name: 'Templates', icon: 'pi-file' },
    { id: 'history', name: 'History', icon: 'pi-history' },
    { id: 'scheduled', name: 'Scheduled', icon: 'pi-calendar' }
  ];

  dataSources = [
    { id: 'vehicle_data', name: 'Vehicle Data', description: 'Location, speed, battery status' },
    { id: 'driver_behavior', name: 'Driver Behavior', description: 'Driving patterns, safety events' },
    { id: 'maintenance', name: 'Maintenance Records', description: 'Service history, schedules' },
    { id: 'energy', name: 'Energy Consumption', description: 'Battery usage, charging data' },
    { id: 'routes', name: 'Route Information', description: 'Trip data, efficiency metrics' },
    { id: 'costs', name: 'Cost Data', description: 'Operational expenses, ROI' }
  ];

  activeTab = 'templates';
  selectedCategory = 'all';
  searchTerm = '';
  showCustomReportBuilder = false;
  historyFilter = 'all';

  customReport = {
    name: '',
    dateFrom: '',
    dateTo: '',
    format: 'pdf',
    dataSources: [] as string[]
  };

  private updateInterval: any;

  ngOnInit(): void {
    this.generateMockData();
    this.filteredTemplates = [...this.reportTemplates];
    this.filteredHistory = [...this.generatedReports];
    
    // Set default date range for custom reports
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.customReport.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
    this.customReport.dateTo = today.toISOString().split('T')[0];

    // Simulate real-time updates for report status
    this.updateInterval = setInterval(() => {
      this.updateReportStatus();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  selectTemplate(template: ReportTemplate): void {
    console.log('Selected template:', template.name);
    // In a real app, this could show template details or generate immediately
  }

  generateMockData(): void {
    // Generate mock report templates
    this.reportTemplates = [
      {
        id: 'fleet-performance',
        name: 'Fleet Performance Summary',
        category: 'fleet',
        description: 'Comprehensive overview of fleet utilization, efficiency, and key performance indicators',
        frequency: 'weekly',
        dataPoints: ['Vehicle Utilization', 'Distance Traveled', 'Fuel Efficiency', 'Uptime Analytics', 'Cost per Mile'],
        icon: 'pi-chart-line',
        estimatedTime: '3-5 min',
        isPopular: false,
        lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'safety-incidents',
        name: 'Safety Incident Report',
        category: 'safety',
        description: 'Detailed analysis of safety events, driver behavior, and compliance metrics',
        frequency: 'daily',
        dataPoints: ['Incident Summary', 'Driver Scores', 'Risk Assessment', 'Compliance Rate', 'Safety Trends'],
        icon: 'pi-shield',
        estimatedTime: '2-3 min',
        isPopular: false,
        lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'energy-consumption',
        name: 'Energy Efficiency Report',
        category: 'energy',
        description: 'Battery usage patterns, charging statistics, and energy optimization recommendations',
        frequency: 'weekly',
        dataPoints: ['Energy Consumption', 'Charging Patterns', 'Battery Health', 'Cost Analysis', 'Efficiency Trends'],
        icon: 'pi-bolt',
        estimatedTime: '4-6 min',
        isPopular: false,
        lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'maintenance-schedule',
        name: 'Maintenance & Service Report',
        category: 'maintenance',
        description: 'Preventive maintenance schedules, service history, and upcoming requirements',
        frequency: 'monthly',
        dataPoints: ['Service History', 'Upcoming Maintenance', 'Cost Tracking', 'Downtime Analysis', 'Part Inventory'],
        icon: 'pi-wrench',
        estimatedTime: '5-7 min',
        isPopular: false,
        lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'driver-performance',
        name: 'Driver Performance Analysis',
        category: 'driver',
        description: 'Individual driver metrics, training needs, and performance comparisons',
        frequency: 'monthly',
        dataPoints: ['Driving Scores', 'Safety Incidents', 'Efficiency Metrics', 'Training Progress', 'Comparative Analysis'],
        icon: 'pi-user',
        estimatedTime: '3-4 min',
        isPopular: false,
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'financial-summary',
        name: 'Financial Performance Report',
        category: 'financial',
        description: 'Operational costs, ROI analysis, and budget vs actual performance',
        frequency: 'monthly',
        dataPoints: ['Operating Costs', 'ROI Analysis', 'Budget Tracking', 'Cost per Vehicle', 'Savings Opportunities'],
        icon: 'pi-dollar',
        estimatedTime: '6-8 min',
        isPopular: false,
        lastGenerated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ];

    // Generate mock generated reports
    this.generatedReports = [
      {
        id: 'RPT-001',
        templateId: 'fleet-performance',
        name: 'Fleet Performance Summary - March 2024',
        category: 'fleet',
        generatedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        },
        status: 'completed',
        fileSize: '2.4 MB',
        format: 'pdf',
        downloadUrl: '/reports/fleet-performance-march-2024.pdf'
      },
      {
        id: 'RPT-002',
        templateId: 'safety-incidents',
        name: 'Safety Incident Report - Weekly',
        category: 'safety',
        generatedDate: new Date(Date.now() - 30 * 60 * 1000),
        dateRange: {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: new Date()
        },
        status: 'generating',
        fileSize: '1.8 MB',
        format: 'excel'
      },
      {
        id: 'RPT-003',
        templateId: 'maintenance-schedule',
        name: 'Maintenance Report - Q1 2024',
        category: 'maintenance',
        generatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dateRange: {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          to: new Date()
        },
        status: 'failed',
        fileSize: '3.1 MB',
        format: 'pdf'
      }
    ];

    // Generate mock scheduled reports
    this.scheduledReports = [
      {
        id: 'SCH-001',
        templateId: 'fleet-performance',
        name: 'Weekly Fleet Performance',
        frequency: 'weekly',
        nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        recipients: ['manager@kia.com', 'fleet@kia.com'],
        format: 'pdf',
        isActive: true
      },
      {
        id: 'SCH-002',
        templateId: 'safety-incidents',
        name: 'Daily Safety Report',
        frequency: 'daily',
        nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000),
        recipients: ['safety@kia.com'],
        format: 'excel',
        isActive: true
      },
      {
        id: 'SCH-003',
        templateId: 'financial-summary',
        name: 'Monthly Financial Summary',
        frequency: 'monthly',
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        recipients: ['finance@kia.com', 'cfo@kia.com'],
        format: 'pdf',
        isActive: false
      }
    ];
  }

  trackByTemplateId(index: number, template: ReportTemplate): string {
    return template.id;
  }

  trackByReportId(index: number, report: GeneratedReport): string {
    return report.id;
  }

  trackByScheduledId(index: number, scheduled: ScheduledReport): string {
    return scheduled.id;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterTemplates();
  }

  getSelectedCategoryName(): string {
    if (this.selectedCategory === 'all') return 'All Reports';
    return this.selectedCategory.charAt(0).toUpperCase() + this.selectedCategory.slice(1) + ' Reports';
  }

  getTemplatesByCategory(categoryId: string): ReportTemplate[] {
    if (categoryId === 'all') {
      return this.reportTemplates;
    }
    return this.reportTemplates.filter(t => t.category === categoryId);
  }

  filterTemplates(): void {
    let filtered = this.selectedCategory === 'all' 
      ? [...this.reportTemplates]
      : this.reportTemplates.filter(t => t.category === this.selectedCategory);

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.dataPoints.some(p => p.toLowerCase().includes(term))
      );
    }

    this.filteredTemplates = filtered;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  generateReport(template: ReportTemplate): void {
    console.log('Generating report:', template.name);
    // Simulate report generation
    const newReport: GeneratedReport = {
      id: `RPT-${Date.now()}`,
      templateId: template.id,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      category: template.category,
      generatedDate: new Date(),
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      },
      status: 'generating',
      fileSize: '0 MB',
      format: 'pdf'
    };

    this.generatedReports.unshift(newReport);
    this.filterHistory();

    // Simulate completion after 3 seconds
    setTimeout(() => {
      newReport.status = 'completed';
      newReport.fileSize = `${(Math.random() * 5 + 1).toFixed(1)} MB`;
      newReport.downloadUrl = `/reports/${template.id}-${Date.now()}.pdf`;
    }, 3000);
  }

  scheduleReport(template: ReportTemplate): void {
    console.log('Scheduling report:', template.name);
    // In a real app, this would open a scheduling dialog
  }

  customizeTemplate(template: ReportTemplate): void {
    console.log('Customizing template:', template.name);
    this.showCustomReportBuilder = true;
    this.customReport.name = `Custom ${template.name}`;
  }

  isSourceSelected(sourceId: string): boolean {
    return this.customReport.dataSources.includes(sourceId);
  }

  toggleDataSource(sourceId: string): void {
    const index = this.customReport.dataSources.indexOf(sourceId);
    if (index > -1) {
      this.customReport.dataSources.splice(index, 1);
    } else {
      this.customReport.dataSources.push(sourceId);
    }
  }

  generateCustomReport(): void {
    console.log('Generating custom report:', this.customReport);
    this.showCustomReportBuilder = false;
  }

  saveTemplate(): void {
    console.log('Saving custom template:', this.customReport);
  }

  previewReport(): void {
    console.log('Previewing report:', this.customReport);
  }

  openScheduleManager(): void {
    this.activeTab = 'scheduled';
    this.showCustomReportBuilder = false;
  }

  viewReportHistory(): void {
    this.activeTab = 'history';
    this.showCustomReportBuilder = false;
  }

  toggleSchedule(scheduleId: string): void {
    const schedule = this.scheduledReports.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.isActive = !schedule.isActive;
    }
  }

  editSchedule(scheduleId: string): void {
    console.log('Editing schedule:', scheduleId);
  }

  deleteSchedule(scheduleId: string): void {
    this.scheduledReports = this.scheduledReports.filter(s => s.id !== scheduleId);
  }

  filterHistory(): void {
    if (this.historyFilter === 'all') {
      this.filteredHistory = [...this.generatedReports];
    } else {
      this.filteredHistory = this.generatedReports.filter(r => r.status === this.historyFilter);
    }
  }

  getReportFormatIcon(format: string): string {
    const icons = {
      pdf: 'pi-file-pdf',
      excel: 'pi-file-excel',
      csv: 'pi-file'
    };
    return icons[format as keyof typeof icons] || 'pi-file';
  }

  getStatusIcon(status: string): string {
    const icons = {
      completed: 'pi-check',
      generating: 'pi-spin pi-spinner',
      failed: 'pi-times',
      scheduled: 'pi-clock'
    };
    return icons[status as keyof typeof icons] || 'pi-info';
  }

  downloadReport(report: GeneratedReport): void {
    console.log('Downloading report:', report.name);
    // In a real app, this would trigger file download
  }

  regenerateReport(report: GeneratedReport): void {
    console.log('Regenerating report:', report.name);
    report.status = 'generating';
    
    setTimeout(() => {
      report.status = 'completed';
      report.generatedDate = new Date();
    }, 3000);
  }

  deleteReport(reportId: string): void {
    this.generatedReports = this.generatedReports.filter(r => r.id !== reportId);
    this.filterHistory();
  }

  updateReportStatus(): void {
    // Simulate status updates for generating reports
    this.generatedReports.forEach(report => {
      if (report.status === 'generating' && Math.random() > 0.7) {
        report.status = 'completed';
        report.fileSize = `${(Math.random() * 5 + 1).toFixed(1)} MB`;
        report.downloadUrl = `/reports/${report.templateId}-${Date.now()}.pdf`;
      }
    });
  }
}