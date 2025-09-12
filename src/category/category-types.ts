export enum PriceType {
  base = "base",
  additional = "additional",
}
export enum WidgetType {
  switch = "switch",
  radio = "radio",
}
export interface PriceConfigurationValue {
  priceType: PriceType;
  availableOptions: string[];
}

export interface PriceConfiguration {
  [key: string]: PriceConfigurationValue;
}

export interface Attribute {
  name: string;
  widgetType: WidgetType;
  defaultValue: unknown;
  availableOptions: string[];
}

export interface Category {
  name: string;
  priceConfiguration: PriceConfiguration;
  attributes: Attribute[];
}
