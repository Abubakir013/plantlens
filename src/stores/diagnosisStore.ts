import { DiagnosisResult } from '@/hooks/usePlantDiagnosis';

let _result: DiagnosisResult | null = null;
let _imageUri: string | null = null;

export const diagnosisStore = {
  set(result: DiagnosisResult, imageUri: string) {
    _result = result;
    _imageUri = imageUri;
  },
  getResult() { return _result; },
  getImageUri() { return _imageUri; },
  clear() { _result = null; _imageUri = null; },
};
