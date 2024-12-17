import 'styled-components';
import * as React from 'react';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      darkGray: string;
      lightGray: string;
      mediumGray: string;
      cyan: string;
      darkCyan: string;
      orange: string;
      primary: string;
      button: string;
    }
  }
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    css?: any;
  }
}