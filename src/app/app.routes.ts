import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'fleet',
    loadComponent: () => import('./features/fleet-overview/fleet-overview.component').then(m => m.FleetOverviewComponent)
  },
  {
    path: 'energy',
    loadComponent: () => import('./features/energy-efficiency/energy-efficiency.component').then(m => m.EnergyEfficiencyComponent)
  },
  {
    path: 'safety',
    loadComponent: () => import('./features/safety-management/safety-monitor.component').then(m => m.SafetyMonitorComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
