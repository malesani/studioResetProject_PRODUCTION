import React from 'react';

import logo_default  from '../assets/newresetproject/logo_large.png';
import logo_small  from '../assets/newresetproject/logo_small.png';
import logo_large  from '../assets/newresetproject/logo_large.png';
import logo_rotate from '../assets/newresetproject/logo_rotate.png';

/**
 * Hook to centralize asset paths for logos and images
 *
 * @returns {Object} An object containing small, large, and rotating logo URLs
 */
export function useLogos() {
    // Preload images for faster rendering
    React.useEffect(() => {
        [logo_small, logo_large, logo_rotate].forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }, []);

  return { logo_default, logo_small, logo_large, logo_rotate };
}

export default useLogos;