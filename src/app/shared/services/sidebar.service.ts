import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);

  isOpen$ = this.isOpenSubject.asObservable();
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  constructor() {}

  toggleSidebar(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  closeSidebar(): void {
    this.isOpenSubject.next(false);
  }

  openSidebar(): void {
    this.isOpenSubject.next(true);
  }

  toggleCollapse(): void {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }
} 