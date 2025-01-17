import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { EmployeeStatisticsFindInput, EmployeeStatistics } from '@gauzy/models';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EmployeeStatisticsService {
    constructor(private http: HttpClient) { }
    avarageBonus$ = new Subject<number>();

    /**
    * Gets the statistics for the selected employee for the last 12 months. 
    * If date is provided in findInput it will return only for the month selected.
    * @param employeeId The id of the employee.
    * @param findInput Object containing valueDate.
    * @returns Promise<EmployeeStatistics>
    */
    getStatisticsByEmployeeId(employeeId: string, findInput?: EmployeeStatisticsFindInput): Promise<EmployeeStatistics> {
        const data = JSON.stringify({ findInput });

        return this.http.get<EmployeeStatistics>(`/api/employee-statistics/${employeeId}`, {
            params: { data }
        }).pipe(first()).toPromise();
    }
}
