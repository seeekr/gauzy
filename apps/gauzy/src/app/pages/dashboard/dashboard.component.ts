import { Component, OnInit, OnDestroy } from '@angular/core';
import { IncomeService } from '../../@core/services/income.service';
import { first, takeUntil } from 'rxjs/operators';
import { Store } from '../../@core/services/store.service';
import { Subject } from 'rxjs';
import { ExpensesService } from '../../@core/services/expenses.service';
import { AuthService } from '../../@core/services/auth.service';
import { RolesEnum, Income, Expense } from '@gauzy/models';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { RecordsHistoryComponent, HistoryType } from '../../@shared/dashboard/records-history/records-history.component';
import { SelectedEmployee } from '../../@theme/components/header/selectors/employee/employee.component';
import { EmployeeStatisticsService } from '../../@core/services/employee-statistics.serivce';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
    private _ngDestroy$ = new Subject<void>();
    hasRole: boolean;
    loading = true;

    selectedDate: Date;
    selectedEmployee: SelectedEmployee;

    totalIncome = 0;
    totalExpense = 0;
    difference = 0;
    bonus = 0;

    avarageBonus: number;

    incomeData: Income[];
    expenseData: Expense[];

    incomeCurrency: string;
    expenseCurrency: string;
    defaultCurrency: string;

    constructor(private incomeService: IncomeService,
        private expenseService: ExpensesService,
        private authService: AuthService,
        private store: Store,
        private dialogService: NbDialogService,
        private employeeStatisticsService: EmployeeStatisticsService) { }

    async ngOnInit() {
        this.hasRole = await this.authService
            .hasRole([RolesEnum.ADMIN, RolesEnum.DATA_ENTRY])
            .pipe(first())
            .toPromise();

        this.store.selectedEmployee$
            .pipe(takeUntil(this._ngDestroy$))
            .subscribe(emp => {
                this.expenseCurrency = null;
                this.incomeCurrency = null;
                this.defaultCurrency = null;
                if (emp) {
                    this.selectedEmployee = emp;
                }

                if (this.selectedDate) {
                    this._loadEmployeeTotalIncome();
                    this._loadEmployeeTotalExpense();
                    this.loading = false;
                }
            });

        this.store.selectedDate$
            .pipe(takeUntil(this._ngDestroy$))
            .subscribe(date => {
                this.selectedDate = date;

                if (this.selectedEmployee) {
                    this._loadEmployeeTotalIncome();
                    this._loadEmployeeTotalExpense();
                    this.loading = false;
                }
            });

        this.employeeStatisticsService.avarageBonus$
            .pipe(takeUntil(this._ngDestroy$))
            .subscribe(bonus => this.avarageBonus = bonus);
    }

    openHistoryDialog(type: HistoryType) {
        this.dialogService.open(RecordsHistoryComponent, {
            context: {
                type,
                recordsData: type === HistoryType.INCOME ? this.incomeData : this.expenseData
            }
        });
    }

    private async _loadEmployeeTotalIncome() {
        const { items } = await this.incomeService
            .getAll(['employee', 'organization'], {
                employee: {
                    id: this.selectedEmployee.id
                }
            }, this.selectedDate);

        this.incomeData = items;

        this.totalIncome = items.reduce((a, b) => a + b.amount, 0);

        if (items.length && this.totalIncome !== 0) {
            const firstItem = items[0];

            this.incomeCurrency = firstItem.currency;
            this.defaultCurrency = firstItem.organization.currency;
        }
    }

    private async _loadEmployeeTotalExpense() {
        const { items } = await this.expenseService
            .getAll(['employee', 'organization'],
                {
                    employee: { id: this.selectedEmployee.id }
                }, this.selectedDate);

        this.expenseData = items;

        this.totalExpense = items.reduce((a, b) => a + b.amount, 0);
        this.difference = this.totalIncome - this.totalExpense;
        this.bonus = (this.difference * 75) / 100;

        if (items.length && this.totalExpense !== 0) {
            const firstItem = items[0];

            this.expenseCurrency = firstItem.currency;
            this.defaultCurrency = firstItem.organization.currency;
        }
    }

    ngOnDestroy() {
        this._ngDestroy$.next();
        this._ngDestroy$.complete();
    }
}
