/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */

export function getServerUrl() {
   if(process.env.NODE_ENV === 'production' ) {
      return `https://rtplus.nz`;
   } else {
        return `http://localhost:${process.env.PORT ?? 3000}`;
   }
}