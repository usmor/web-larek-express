const convertToMs = (timeString: string): number => {
  const timeRecords: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  const match = timeString.match(/^(\d+)\s*([a-zA-Z]+)$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (!timeRecords[unit]) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  return value * timeRecords[unit];
};

export default convertToMs;
