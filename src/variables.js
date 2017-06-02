import {adjustHue, lighten, stripUnit} from 'polished';

export const BRAND_PRIMARY = 'deepskyblue';

export const PADDING_BASE = '1.125rem';
export const PADDING_SMALL = `${stripUnit(PADDING_BASE) / 1.5}rem`; // 0.75rem
export const PADDING_SMALLER = `${stripUnit(PADDING_SMALL) / 1.5}rem`; // 0.5rem
export const PADDING_SMALLEST = `${stripUnit(PADDING_SMALLER) / 2}rem`; // 0.25rem
export const PADDING_LARGE = `${stripUnit(PADDING_BASE) / 0.75}rem`; // 1.5rem
export const PADDING_LARGER = `${stripUnit(PADDING_LARGE) / 1.5}rem`; // 2.25rem
export const PADDING_LARGEST = `${stripUnit(PADDING_LARGER) / 1.5}rem`; // 3rem

export const GRAY_DARKEST = lighten(0.05, 'black');
export const GRAY_DARKER = lighten(0.1, 'black');
export const GRAY_DARK = lighten(0.15, 'black');
export const GRAY = lighten(0.2, 'black');
export const GRAY_LIGHT = lighten(0.3, 'black');
export const GRAY_LIGHTER = lighten(0.45, 'black');
export const GRAY_LIGHTEST = lighten(0.7, 'black');

export const LAYER_SHAPE_COLOR = adjustHue(-90, BRAND_PRIMARY);
export const LAYER_DUMMY_COLOR = adjustHue(-30, BRAND_PRIMARY);
export const LAYER_TEXT_COLOR = adjustHue(30, BRAND_PRIMARY);
export const LAYER_IMAGE_COLOR = adjustHue(90, BRAND_PRIMARY);
