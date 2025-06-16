# Kia Fleet Management System - MVP

Ein modernes Fleet Management System Frontend für Kia PBV (Purpose Built Vehicle) Fahrzeuge im B2B-Bereich.

## 🎯 Projektübersicht

Dieses MVP demonstriert die Kernfunktionalitäten des Kia PBV Fleet Management Systems:

- **Echtzeit-Flottenüberwachung** - Live-Status und Standortverfolgung
- **Sicherheitsmanagement** - Risikobewertung und Fahrverhalten
- **Energieeffizienz** - Verbrauchsanalyse und Kostenoptimierung
- **Wartungsmanagement** - Proaktive Instandhaltung
- **Umfassende Berichte** - Datengestützte Erkenntnisse

## 🛠 Technologie-Stack

- **Frontend**: Angular 19
- **UI Framework**: PrimeNG 
- **Charting**: Chart.js / PrimeNG Charts
- **Maps**: Leaflet / Google Maps
- **State Management**: NgRx (falls erforderlich)
- **Styling**: SCSS + Kia Design System
- **Build Tool**: Angular CLI

## 🎨 Design Prinzipien

- **Kia Branding**: Offizielle Farben, Typografie und Icons
- **Responsive Design**: Mobile-first Ansatz
- **Accessibility**: WCAG 2.1 Standards
- **Performance**: Optimiert für große Datenmengen

## 📁 Projektstruktur

```
src/
├── app/
│   ├── core/                 # Singleton Services
│   ├── shared/               # Gemeinsame Komponenten
│   ├── features/             # Feature Module
│   │   ├── dashboard/
│   │   ├── fleet-overview/
│   │   ├── vehicle-details/
│   │   ├── safety-management/
│   │   ├── energy-efficiency/
│   │   ├── reports/
│   │   └── settings/
│   └── layout/               # App Layout
├── assets/                   # Statische Assets
└── styles/                   # Globale Styles
```

## 🚀 Installation & Setup

```bash
# Dependencies installieren
npm install

# Development Server starten
ng serve

# Build für Production
ng build --prod
```

## 📊 MVP Features

### Dashboard
- [ ] Flottenübersicht mit KPI Cards
- [ ] Echtzeit-Karte mit Fahrzeugpositionen
- [ ] Alert-System für kritische Ereignisse
- [ ] Quick Actions Panel

### Fleet Management
- [ ] Fahrzeugliste mit Filterung
- [ ] Einzelfahrzeug-Detailansicht
- [ ] Fahrzeugstatus-Management
- [ ] Gruppen-/Tag-Verwaltung

### Sicherheit & Compliance
- [ ] Fahrverhalten-Dashboard
- [ ] Geschwindigkeitsüberschreitungen
- [ ] Risiko-Scoring
- [ ] Incident Reports

### Energie & Kosten
- [ ] Energieverbrauch-Tracking
- [ ] Kostenanalyse
- [ ] Effizienz-Benchmarks
- [ ] TCO-Optimierung

### Wartung & Service
- [ ] Wartungskalender
- [ ] Service-Alerts
- [ ] Reparaturhistorie
- [ ] Techniker-Zuweisungen

## 🎨 Kia Design System

Das Projekt folgt den Kia Markenrichtlinien:

- **Primärfarben**: Kia Rot (#E4003A), Anthrazit (#2C2C2C)
- **Sekundärfarben**: Weiß (#FFFFFF), Hellgrau (#F5F5F5)
- **Typografie**: Kia Signature Font Familie
- **Spacing**: 8px Grid-System
- **Komponenten**: Konsistent mit Kia Web-Standards

## 📈 Performance Ziele

- **Erste Seitenladung**: < 3 Sekunden
- **Time to Interactive**: < 5 Sekunden
- **Lighthouse Score**: > 90
- **Bundle Size**: < 2MB initial

## 🧪 Testing Strategy

- **Unit Tests**: Jest + Angular Testing Utilities
- **Integration Tests**: Cypress
- **E2E Tests**: Playwright
- **Accessibility Tests**: axe-core

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1024px
- **Desktop**: 1025px+
- **Large Desktop**: 1440px+

## 🔒 Sicherheit & Datenschutz

- GDPR-konform
- Verschlüsselte Datenübertragung
- Rollenbasierte Zugriffskontrolle
- Audit Logs

---

© 2025 Kia Deutschland GmbH - Alle Rechte vorbehalten. 