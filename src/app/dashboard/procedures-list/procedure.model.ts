export interface Procedure {
  activityId: number;
  activityDate: string; // ISO string date
  activityTime: string; // ISO string time
  employeeCode: string;
  employeeFullName: string;
  procedureName: string;
  procedureType: string;
  assignedToLoggedUser?: boolean;
  hasHistory?: boolean;
  procedureScheduledOnEmployeesWorkingDay?: boolean;
}

export interface ProcedureResponse {
  content: Procedure[];
  totalElements: number;
  totalPages: number;
}
