export type Identity = {
  usages: {
    id: number;
    date: string;
    usageCount: number;
    clientId: number;
  }[];
} & {
  id: number;
  name: string;
  email: string;
  apiKey: string;
  hectaresStock: number;
  priceForHectare: number;
  dailyLimit: number;
};
