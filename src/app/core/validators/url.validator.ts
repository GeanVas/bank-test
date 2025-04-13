import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    try {
      new URL(value); 
      return null;
    } catch {
      return { invalidUrl: true };
    }
  };
}