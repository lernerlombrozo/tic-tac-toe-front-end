import { TestBed } from '@angular/core/testing';

import { MockSocketsService } from './mock-sockets.service';

describe('MockSocketsService', () => {
  let service: MockSocketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockSocketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
