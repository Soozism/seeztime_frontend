import apiService from './api';
import { HolidayCreate, HolidayResponse } from '../types';

class HolidaysService {
  async listHolidays(params?: { year?: number; is_national?: boolean; expand?: boolean }): Promise<HolidayResponse[]> {
    return apiService.get<HolidayResponse[]>('/working-hours/holidays', params);
  }

  async createHoliday(data: HolidayCreate): Promise<HolidayResponse> {
    return apiService.post<HolidayResponse>('/working-hours/holidays', data);
  }

  async updateHoliday(id: number, data: HolidayCreate): Promise<HolidayResponse> {
    return apiService.put<HolidayResponse>(`/working-hours/holidays/${id}`, data);
  }

  async createIranianHolidays(year: number): Promise<void> {
    return apiService.post<void>(`/working-hours/holidays/iranian/${year}`);
  }

  async deleteHoliday(id: number): Promise<void> {
    return apiService.delete<void>(`/working-hours/holidays/${id}`);
  }
}

const holidaysService = new HolidaysService();
export default holidaysService;