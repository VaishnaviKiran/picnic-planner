// src/components/WeatherIcon.tsx
import React from "react";

type WeatherIconProps = {
  condition: string;
  size?: number;
  color?: string;
};

const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  size = 50,
  color,
}) => {
  const emojiStyle = {
    fontSize: `${size}px`,
    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
  };

  if (condition === "Rain") {
    return <span style={emojiStyle}>🌧️</span>; // Rain emoji
  }
  if (condition === "Clouds") {
    return <span style={emojiStyle}>⛅</span>; // Cloud emoji  
  }
  return <span style={emojiStyle}>☀️</span>; // Sun emoji (default)
};

export default WeatherIcon;
