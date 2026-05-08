export const saveLastWeather = (data: any) => {
  localStorage.setItem('last_weather_data', JSON.stringify(data));
};

export const getLastWeather = () => {
  const saved = localStorage.getItem('last_weather_data');
  return saved ? JSON.parse(saved) : null; // Shows last data if no internet 
};