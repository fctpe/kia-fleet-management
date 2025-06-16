import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="kia-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="copyright">
            <p>&copy; {{ currentYear }} Kia Deutschland GmbH - Alle Rechte vorbehalten.</p>
          </div>
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy Policy</a>
            <span class="divider">|</span>
            <a href="#" class="footer-link">Terms of Service</a>
            <span class="divider">|</span>
            <a href="#" class="footer-link">Support</a>
          </div>
          <div class="version-info">
            <span class="version">Fleet Management v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
} 