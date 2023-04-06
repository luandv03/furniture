export interface IProductUpdate {
  title?: string;
  description?: string;
  price?: string;
  discount?: string;
  price_sale?: string;
  qty?: string;
  category?: string;
  status?: string;
}

export interface IPhoto {
  public_id: string;
  url_link: string;
  secure_url: string;
}
