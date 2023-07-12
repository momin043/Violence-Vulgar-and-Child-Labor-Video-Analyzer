import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginboxService {
  private booleanValue = false;

  setBooleanValue(value: boolean): void {
    this.booleanValue = value;
  }

  getBooleanValue(): boolean {
    return this.booleanValue;
  }
}
