const host: string | undefined = process.env.HOST;

const CONFIG = {
  host: host,
  api: host + "/api",
};

export default CONFIG;
