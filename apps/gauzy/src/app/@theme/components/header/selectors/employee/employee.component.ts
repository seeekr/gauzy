import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { EmployeesService } from 'apps/gauzy/src/app/@core/services/employees.service';
import { first, takeUntil } from 'rxjs/operators';
import { Store } from 'apps/gauzy/src/app/@core/services/store.service';
import { Subject } from 'rxjs';

export interface SelectedEmployee {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
}

@Component({
    selector: 'ga-employee-selector',
    templateUrl: './employee.component.html',
    styleUrls: ['./employee.component.scss'],
})

export class EmployeeSelectorComponent implements OnInit, OnDestroy {
    @Input()
    skipGlobalChange: boolean;
    @Input()
    disabled: boolean;

    people: SelectedEmployee[] = [];
    selectedEmployee: SelectedEmployee;

    private _ngDestroy$ = new Subject<void>();

    constructor(
        private employeesService: EmployeesService,
        private store: Store
    ) { }

    ngOnInit() {
        this._loadPople();
        this._loadEmployeeId();
    }

    searchEmployee(term: string, item: any) {
        if (item.firstName && item.lastName) {
            return (
                item.firstName.toLowerCase().includes(term) ||
                item.lastName.toLowerCase().includes(term)
            );
        } else if (item.firstName) {
            return item.firstName.toLowerCase().includes(term);
        } else if (item.lastName) {
            return item.lastName.toLowerCase().includes(term);
        }
    }

    selectEmployee(employee: SelectedEmployee) {
        if (!this.skipGlobalChange) {
            this.store.selectedEmployee = employee;
        }
    }

    getShortenedName(firstName: string, lastName: string) {
        if (firstName && lastName) {
            return firstName + ' ' + lastName[0] + '.';
        } else {
            return firstName || lastName || '[error: bad name]';
        }
    }

    getFullName(firstName: string, lastName: string) {
        return firstName && lastName
            ? firstName + ' ' + lastName
            : firstName || lastName;
    }

    private _loadEmployeeId() {
        this.store.selectedEmployee$
            .pipe(takeUntil(this._ngDestroy$))
            .subscribe(emp => {
                this.selectedEmployee = emp;
            });
    }

    private async _loadPople() {
        const { items } = await this.employeesService.getAll(['user']).pipe(first()).toPromise();

        const load = (loadItems) => {
            this.people = [{
                id: null,
                firstName: "All Employees",
                lastName: '',
                imageUrl: 'https://i.imgur.com/XwA2T62.jpg'
            }, ...loadItems.map((e) => {
                return {
                    id: e.id,
                    firstName: e.user.firstName,
                    lastName: e.user.lastName,
                    imageUrl: e.user.imageUrl
                }
            })];
        }

        this.store.selectedOrganization$.subscribe((o) => {
            if (o) {
                load(items.filter((e) => e.orgId === o.id));
            }
        })

        const selectedOrg = this.store.selectedOrganization;
        load(selectedOrg ? items.filter((e) => e.orgId === selectedOrg.id) : items);

        if (items.length > 0 && !this.store.selectedEmployee) {

            this.store.selectedEmployee = this.people[0];
        }

        if (!this.selectedEmployee) { // This is so selected employee doesn't get reset when it's already set from somewhere else
            this.selectEmployee(this.people[0]);
            this.selectedEmployee = this.people[0];
        }
    }

    ngOnDestroy() {
        this._ngDestroy$.next();
        this._ngDestroy$.complete();
    }
}