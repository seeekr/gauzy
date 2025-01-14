import { Observable, from, of } from 'rxjs';
import { NbAuthResult, NbAuthStrategy } from '@nebular/auth';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/observable/of';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { User } from '@gauzy/models';
import { NbAuthStrategyClass } from '@nebular/auth/auth.options';
import { AuthService } from '../services/auth.service';
import { Store } from '../services/store.service';

@Injectable()
export class AuthStrategy extends NbAuthStrategy {
	private static config = {
		login: {
			redirect: {
				success: '/',
				failure: null
			},
			defaultErrors: [
				'Login/Email combination is not correct, please try again.'
			],
			defaultMessages: ['You have been successfully logged in.']
		},
		register: {
			redirect: {
				success: '/',
				failure: null
			},
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: ['You have been successfully registered.']
		},
		logout: {
			redirect: {
				success: '/',
				failure: null
			},
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: ['You have been successfully logged out.']
		},
		requestPass: {
			redirect: {
				success: '/',
				failure: null
			},
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: [
				'Reset password instructions have been sent to your email.'
			]
		},
		resetPass: {
			redirect: {
				success: '/',
				failure: null
			},
			resetPasswordTokenKey: 'reset_password_token',
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: ['Your password has been successfully changed.']
		}
	};

	constructor(
		private route: ActivatedRoute,
		private authService: AuthService,
		private store: Store
	) {
		super();
	}

	static setup(options: { name: string }): [NbAuthStrategyClass, any] {
		return [AuthStrategy, options];
	}

	authenticate(args: {
		email: string;
		password: string;
		rememberMe?: boolean | null;
	}): Observable<NbAuthResult> {
		const { email, password } = args;

		// TODO implement remember me feature
		const rememberMe = !!args.rememberMe;

		const loginInput = {
			findObj: {
				email
			},
			password
		}

		return this.authService.login(loginInput).pipe(
			map(
				(res: {
					user?: User,
					token?: string;
				}) => {
					let user, token;

					if (res) {
						user = res.user;
						token = res.token;
					}

					if (!user) {
						return new NbAuthResult(
							false,
							res,
							false,
							AuthStrategy.config.login.defaultErrors
						);
					}

					this.store.userId = user.id;
					this.store.token = token;

					return new NbAuthResult(
						true,
						res,
						AuthStrategy.config.login.redirect.success,
						[],
						AuthStrategy.config.login.defaultMessages
					);
				}
			),
			catchError((err) => {
				console.log(err);

				return of(
					new NbAuthResult(
						false,
						err,
						false,
						AuthStrategy.config.login.defaultErrors,
						[AuthStrategy.config.login.defaultErrors]
					)
				);
			})
		);
	}

	register(args: {
		email: string;
		fullName: string;
		password: string;
		confirmPassword: string;
		terms: boolean;
	}): Observable<NbAuthResult> {
		const { email, fullName, password, confirmPassword, terms } = args;

		if (password !== confirmPassword) {
			return Observable.of(
				new NbAuthResult(false, null, null, [
					"The passwords don't match."
				])
			);
		}

		const registerInput = {
			user: {
				firstName: fullName ? fullName.split(' ').slice(0, -1).join(' ') : null,
				lastName: fullName ? fullName.split(' ').slice(-1).join(' ') : null,
				email
			},
			password
		}

		return this.authService.register(registerInput).pipe(
			map((res) => {
				return new NbAuthResult(
					true,
					res,
					AuthStrategy.config.register.redirect.success,
					[],
					AuthStrategy.config.register.defaultMessages
				);
			}),
			catchError((err) => {
				console.log(err);

				return of(
					new NbAuthResult(
						false,
						err,
						false,
						AuthStrategy.config.register.defaultErrors,
						[AuthStrategy.config.register.defaultErrors]
					)
				);
			})
		);
	}

	logout(): Observable<NbAuthResult> {
		return from(this._logout());
	}

	requestPassword(data?: any): Observable<NbAuthResult> {
		throw new Error('Not implemented yet');
	}

	resetPassword(data: any = {}): Observable<NbAuthResult> {
		throw new Error('Not implemented yet');
	}

	refreshToken(data?: any): Observable<NbAuthResult> {
		throw new Error('Not implemented yet');
	}

	private async _logout(): Promise<NbAuthResult> {
		this.store.clear();

		return new NbAuthResult(
			true,
			null,
			AuthStrategy.config.logout.redirect.success,
			[],
			AuthStrategy.config.logout.defaultMessages
		);
	}
}
