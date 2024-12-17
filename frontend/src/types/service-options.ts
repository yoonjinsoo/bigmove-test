export interface ServiceOption {
  id: string;
  type: string;
  label: string;
  description: string;
  fee: number | null;
  available: boolean;
}

export interface ServiceOptionsResponse {
  floor_options: ServiceOption[];
  ladder_options: ServiceOption[];
  special_vehicle_options: ServiceOption[];
}

export interface SelectedOptions {
  floor_option_id?: string;
  ladder_option_id?: string;
  special_vehicle_option_id?: string;
  total_fee: number;
} 