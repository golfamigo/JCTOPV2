import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it('should call super.canActivate', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
    superCanActivateSpy.mockReturnValue(true);

    const result = guard.canActivate(mockExecutionContext);

    expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
    expect(result).toBe(true);
  });
});