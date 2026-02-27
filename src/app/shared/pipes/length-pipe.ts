import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'length',
})
export class LengthPipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength: number): string {
    const text = (value ?? '').trim();
    if (!text || maxLength <= 0) {
      return '';
    }

    if (text.length <= maxLength) {
      return text;
    }

    const words = text.split(/\s+/);
    let result = '';

    for (const word of words) {
      const candidate = result ? `${result} ${word}` : word;

      if (candidate.length > maxLength) {
        break;
      }

      result = candidate;
    }

    if (!result) {
      return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
    }

    return `${result.replace(/[.?,!-]+$/g, '')}...`;
  }
}
