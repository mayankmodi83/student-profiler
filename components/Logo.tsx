import React from 'react';
import { logoBase64 } from '../assets/logo';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => (
    <img 
        src={logoBase64}
        alt="Sarjan Foundation Logo" 
        className={className}
    />
);

export default Logo;