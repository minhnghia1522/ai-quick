//  eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Obj<V = any> = { [attr: string]: V };

export type SelectOption<D extends Obj = Obj> = {
  value: string | number;
  label: string | number;
  disabled?: boolean;
  tooltipTitle?: string;
  data?: D;
};
