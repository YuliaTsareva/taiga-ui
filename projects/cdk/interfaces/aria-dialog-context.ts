import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus';

export interface TuiAriaDialogContext {
    readonly component: PolymorpheusComponent<any>;
    readonly id: string;
    readonly createdAt: number;
}
