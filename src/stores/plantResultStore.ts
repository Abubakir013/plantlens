import { PlantResult } from '@/hooks/useClaudeVision';

let _result: PlantResult | null = null;
let _imageUri: string | null = null;

export const plantResultStore = {
  set(result: PlantResult, imageUri: string) {
    _result = result;
    _imageUri = imageUri;
  },
  getResult() { return _result; },
  getImageUri() { return _imageUri; },
  clear() { _result = null; _imageUri = null; },
};
