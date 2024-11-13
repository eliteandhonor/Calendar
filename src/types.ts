export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  country: string;
  color: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  timezone: string;
  capital: string;
}