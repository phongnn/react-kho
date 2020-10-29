const isServer = typeof window === "undefined";
const to2Digits = (num) => `${100 + num}`.substr(1);
const formatTime = (d) =>
  `${to2Digits(d.getHours())}:${to2Digits(d.getMinutes())}:${to2Digits(
    d.getSeconds()
  )}`;

export const fetchData = () =>
  new Promise((resolve) => {
    const now = formatTime(new Date());
    const result = isServer
      ? [...Array(3)].map((_) => `Loaded by server at ${now}`)
      : [`Loaded by client at ${now}`];
    setTimeout(() => resolve(result), 1000);
  });
