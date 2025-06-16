import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../shared/services/sidebar.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  submenu?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Backdrop -->
    <div class="sidebar-backdrop" 
         [class.open]="isMobileOpen" 
         (click)="closeMobileSidebar()">
    </div>

    <aside class="kia-sidebar" 
           [class.collapsed]="isCollapsed"
           [class.mobile-open]="isMobileOpen">
      <div class="sidebar-header">
        <button 
          class="collapse-btn" 
          type="button" 
          (click)="toggleCollapse()"
          [attr.aria-label]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i class="pi" [class.pi-angle-left]="!isCollapsed" [class.pi-angle-right]="isCollapsed"></i>
        </button>
        
        <!-- Mobile Close Button -->
        <button class="mobile-close-btn" type="button" (click)="closeMobileSidebar()" title="Close Menu">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-menu">
          <li *ngFor="let item of menuItems" class="nav-item">
            <a 
              [routerLink]="item.route" 
              routerLinkActive="active"
              class="nav-link"
              [title]="item.label"
              (click)="onNavLinkClick()"
            >
              <i class="nav-icon pi" [class]="item.icon"></i>
              <span class="nav-label">{{ item.label }}</span>
              <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="system-status" *ngIf="!isCollapsed">
          <div class="status-item">
            <span class="status-label">System Status</span>
            <span class="status-indicator status-indicator--online">Online</span>
          </div>
          <div class="status-item">
            <span class="status-label">Last Sync</span>
            <span class="status-time">2 min ago</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isMobileOpen = false;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi-home',
      route: '/dashboard'
    },
    {
      label: 'Fleet Overview',
      icon: 'pi-car',
      route: '/fleet',
      badge: 24
    },
    {
      label: 'Energy Management',
      icon: 'pi-bolt',
      route: '/energy'
    },
    {
      label: 'Safety Monitor',
      icon: 'pi-shield',
      route: '/safety',
      badge: 3
    },
    {
      label: 'Reports',
      icon: 'pi-chart-bar',
      route: '/reports'
    },
    {
      label: 'Settings',
      icon: 'pi-cog',
      route: '/settings'
    }
  ];

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    // Subscribe to sidebar state
    this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isMobileOpen = isOpen;
    });

    this.sidebarService.isCollapsed$.subscribe(isCollapsed => {
      this.isCollapsed = isCollapsed;
    });
  }

  toggleCollapse(): void {
    this.sidebarService.toggleCollapse();
  }

  closeMobileSidebar(): void {
    this.sidebarService.closeSidebar();
  }

  onNavLinkClick(): void {
    // Close mobile sidebar when a navigation link is clicked
    this.sidebarService.closeSidebar();
  }
} 