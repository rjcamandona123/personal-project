
import React from 'react';

export const NetworkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* Top box */}
    <path d="M6 3H18C19.1046 3 20 3.89543 20 5V7C20 8.10457 19.1046 9 18 9H6C4.89543 9 4 8.10457 4 7V5C4 3.89543 4.89543 3 6 3Z" />
    {/* Vertical connector from top box */}
    <path d="M11 9V12H13V9H11Z" />
    {/* Horizontal bar */}
    <path d="M3 12H21V14H3V12Z" />
    {/* Bottom left box and connector */}
    <path d="M5 14V16H7V14H5Z" />
    <path d="M3 16H9C9.55228 16 10 16.4477 10 17V19C10 19.5523 9.55228 20 9 20H3C2.44772 20 2 19.5523 2 19V17C2 16.4477 2.44772 16 3 16Z" />
    {/* Bottom middle box and connector */}
    <path d="M11 14V16H13V14H11Z" />
    <path d="M9 16H15C15.5523 16 16 16.4477 16 17V19C16 19.5523 15.5523 20 15 20H9C8.44772 20 8 19.5523 8 19V17C8 16.4477 8.44772 16 9 16Z" />
    {/* Bottom right box and connector */}
    <path d="M17 14V16H19V14H17Z" />
    <path d="M15 16H21C21.5523 16 22 16.4477 22 17V19C22 19.5523 21.5523 20 21 20H15C14.4477 20 14 19.5523 14 19V17C14 16.4477 14.4477 16 15 16Z" />
  </svg>
);
