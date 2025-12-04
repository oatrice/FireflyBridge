import { TYPES_VERSION } from './types';

describe('types', () => {
    it('should export version', () => {
        expect(TYPES_VERSION).toBe('1.0.0');
    });
});
