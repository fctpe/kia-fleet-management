import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../shared/services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="kia-header">
      <div class="header-container">
        <!-- Left: Mobile Menu Toggle & Logo -->
        <div class="header-left">
          <!-- Mobile Menu Toggle -->
          <button class="mobile-menu-btn" type="button" (click)="toggleMobileMenu()" title="Toggle Menu">
            <i class="pi pi-bars"></i>
          </button>
          
          <div class="logo-section">
            <img src="/KiaLogo.png" alt="Kia" class="kia-logo" />
            <div class="system-info">
              <h1 class="system-title">PBV Fleet Management</h1>
              <span class="system-subtitle">Internal Operations Dashboard</span>
            </div>
          </div>
        </div>

        <!-- Right: User & System Actions -->
        <div class="header-right">
          <!-- System Status -->
          <div class="system-status">
            <span class="status-indicator online">
              <i class="pi pi-circle-fill"></i>
              System Online
            </span>
          </div>

          <!-- Global Search -->
          <button class="search-btn" type="button" title="Global Search">
            <i class="pi pi-search"></i>
          </button>

          <!-- Notifications -->
          <button class="notification-btn" type="button" title="Notifications">
            <i class="pi pi-bell"></i>
            <span class="notification-badge">3</span>
          </button>

          <!-- User Menu -->
          <div class="user-menu" (click)="toggleUserMenu()">
            <div class="user-avatar">
              <i class="pi pi-user"></i>
            </div>
            <div class="user-info">
              <span class="user-name">Furkan Cakmaktepe</span>
              <span class="user-role">Fleet Administrator</span>
            </div>
            <i class="pi pi-chevron-down user-menu-arrow"></i>
          </div>

          <!-- User Dropdown -->
          <div class="user-dropdown" [class.open]="isUserMenuOpen">
            <a href="#" class="dropdown-item">
              <i class="pi pi-user"></i>
              Profile Settings
            </a>
            <a href="#" class="dropdown-item">
              <i class="pi pi-cog"></i>
              Preferences
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
              <i class="pi pi-question-circle"></i>
              Help & Support
            </a>
            <a href="#" class="dropdown-item logout">
              <i class="pi pi-sign-out"></i>
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isUserMenuOpen = false;

  constructor(private sidebarService: SidebarService) {}

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu(): void {
    this.sidebarService.toggleSidebar();
  }
} 