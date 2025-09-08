/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */

export function getServerUrl() {
   if(process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
   } else {
        return `http://localhost:${process.env.PORT ?? 3000}`;
   }
}