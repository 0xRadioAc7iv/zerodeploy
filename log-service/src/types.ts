export type RedisStreamEntry = {
  name: string;
  messages: {
    id: string;
    message: {
      message: string;
    };
  }[];
};
