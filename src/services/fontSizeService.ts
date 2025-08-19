export type FontSize = 'small' | 'medium' | 'large';

const CLASS_SMALL = 'font-size-small';
const CLASS_MEDIUM = 'font-size-medium';
const CLASS_LARGE = 'font-size-large';

function applyClass(size: FontSize) {
  const root = document.documentElement;
  root.classList.remove(CLASS_SMALL, CLASS_MEDIUM, CLASS_LARGE);
  switch (size) {
    case 'small':
      root.classList.add(CLASS_SMALL);
      break;
    case 'large':
      root.classList.add(CLASS_LARGE);
      break;
    case 'medium':
    default:
      root.classList.add(CLASS_MEDIUM);
      break;
  }
}

export function getSavedFontSize(): FontSize {
  try {
    const saved = localStorage.getItem('generalSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const size = parsed?.displaySettings?.fontSize as FontSize | undefined;
      if (size === 'small' || size === 'medium' || size === 'large') return size;
    }
  } catch (e) {
    // ignore
  }
  return 'medium';
}

export function applyFontSize(size: FontSize) {
  try {
    applyClass(size);
  } catch (e) {
    // ignore
  }
}

export function initFontSize() {
  try {
    const size = getSavedFontSize();
    applyClass(size);
  } catch (e) {
    // Fallback to medium
    applyClass('medium');
  }
}