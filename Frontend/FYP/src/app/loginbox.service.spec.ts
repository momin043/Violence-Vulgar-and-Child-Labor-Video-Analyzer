import { TestBed } from '@angular/core/testing';

import { LoginboxService } from './loginbox.service';

describe('LoginboxService', () => {
  let service: LoginboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
