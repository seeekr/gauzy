import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee, EmployeeFindInput, EmployeeCreateInput as IEmployeeCreateInput } from '@gauzy/models';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable()
export class EmployeesService {

    constructor(
        private http: HttpClient
    ) { }

    getAll(relations?: string[], findInput?: EmployeeFindInput): Observable<{ items: Employee[], total: number }> {
        const data = JSON.stringify({ relations, findInput });
        return this.http.get<{ items: Employee[], total: number }>(`/api/employee`, {
            params: { data }
        });
    }

    getEmployeeById(id: string) {
        return this.http.get<Employee>(`/api/employee/${id}`).pipe(first()).toPromise();
    }

    setEmployeeAsInactive(id: string): Promise<Employee> {
        return this.http.put<Employee>(`/api/employee/${id}`, { isActive: false }).pipe(first()).toPromise();
    }

    setEmployeeEndWork(id: string, date: Date): Promise<Employee> {
        return this.http.put<Employee>(`/api/employee/${id}`, { endWork: date }).pipe(first()).toPromise();
    }

    create(createInput: IEmployeeCreateInput): Observable<Employee> {
        return this.http.post<Employee>('/api/employee/create', createInput);
    }
}