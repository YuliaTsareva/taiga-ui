import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Input,
    Optional,
    Output,
    Self,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {AbstractTuiInputCard} from '@taiga-ui/addon-commerce/components/input-card';
import {TUI_CARD_MASK} from '@taiga-ui/addon-commerce/constants';
import {TuiCard} from '@taiga-ui/addon-commerce/interfaces';
import {TuiCodeCVCLength} from '@taiga-ui/addon-commerce/types';
import {tuiCreateAutoCorrectedExpirePipe} from '@taiga-ui/addon-commerce/utils';
import {
    tuiAsControl,
    tuiAsFocusableItemAccessor,
    TuiAutofillFieldName,
    TuiAutoFocusDirective,
    tuiDefaultProp,
    TuiFocusableElementAccessor,
    tuiIsElement,
    tuiIsInput,
    tuiIsNativeFocused,
    tuiIsNativeFocusedIn,
    tuiPure,
    tuiRequiredSetter,
} from '@taiga-ui/cdk';
import {
    MODE_PROVIDER,
    TEXTFIELD_CONTROLLER_PROVIDER,
    TUI_DIGIT_REGEXP,
    TUI_MODE,
    TUI_NON_DIGIT_REGEXP,
    TUI_TEXTFIELD_WATCHED_CONTROLLER,
    tuiAsDataListHost,
    TuiBrightness,
    TuiDataListComponent,
    TuiDataListDirective,
    TuiDataListHost,
    TuiTextfieldController,
    TuiTextMaskOptions,
} from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import {Observable} from 'rxjs';

import {
    TUI_INPUT_CARD_GROUPED_OPTIONS,
    TUI_INPUT_CARD_GROUPED_TEXTS,
    TuiCardGroupedTexts,
    TuiInputCardGroupedOptions,
} from './input-card-grouped.providers';

@Component({
    selector: 'tui-input-card-grouped',
    templateUrl: './input-card-grouped.template.html',
    styleUrls: ['./input-card-grouped.style.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        tuiAsFocusableItemAccessor(TuiInputCardGroupedComponent),
        tuiAsControl(TuiInputCardGroupedComponent),
        tuiAsDataListHost(TuiInputCardGroupedComponent),
        MODE_PROVIDER,
        TEXTFIELD_CONTROLLER_PROVIDER,
    ],
    host: {
        '($.data-mode.attr)': 'mode$',
        'data-size': 'l',
    },
})
export class TuiInputCardGroupedComponent
    extends AbstractTuiInputCard<TuiCard, TuiInputCardGroupedOptions>
    implements TuiFocusableElementAccessor, TuiDataListHost<Partial<TuiCard>>
{
    @ViewChild('inputCard')
    private readonly inputCard?: ElementRef<HTMLInputElement>;

    @ViewChild('inputCard', {read: TuiAutoFocusDirective})
    private readonly cardNumberAutofocusRef?: TuiAutoFocusDirective;

    @ViewChild('inputExpire')
    private readonly inputExpire?: ElementRef<HTMLInputElement>;

    @ViewChild('inputExpire', {read: TuiAutoFocusDirective})
    private readonly expireCardAutofocusRef?: TuiAutoFocusDirective;

    @ViewChild('inputCVC')
    private readonly inputCVC?: ElementRef<HTMLInputElement>;

    @ViewChild('inputCVC', {read: TuiAutoFocusDirective})
    private readonly cvcCardAutofocusRef?: TuiAutoFocusDirective;

    private expireInert = false;

    @Input()
    @tuiDefaultProp()
    exampleText = this.options.exampleText;

    @Input()
    @tuiDefaultProp()
    cardValidator = this.options.cardValidator;

    @Input()
    @tuiRequiredSetter()
    set codeLength(length: TuiCodeCVCLength) {
        this.exampleTextCVC = '0'.repeat(length);
        this.maskCVC = {
            mask: new Array(length).fill(TUI_DIGIT_REGEXP),
            guide: false,
        };
    }

    @Output()
    readonly autofilledChange = new EventEmitter<boolean>();

    @ContentChild(TuiDataListDirective, {read: TemplateRef})
    readonly dropdown: PolymorpheusContent;

    @ContentChild(TuiDataListComponent)
    readonly datalist?: TuiDataListComponent<TuiCard>;

    exampleTextCVC = this.options.exampleTextCVC;

    maskCVC: TuiTextMaskOptions = {
        mask: new Array(3).fill(TUI_DIGIT_REGEXP),
        guide: false,
    };

    readonly maskCard: TuiTextMaskOptions = {
        mask: TUI_CARD_MASK,
        guide: false,
        pipe: conformedValue => conformedValue.trim(),
    };

    readonly maskExpire: TuiTextMaskOptions = {
        mask: [
            TUI_DIGIT_REGEXP,
            TUI_DIGIT_REGEXP,
            '/',
            TUI_DIGIT_REGEXP,
            TUI_DIGIT_REGEXP,
        ],
        pipe: tuiCreateAutoCorrectedExpirePipe(),
        guide: false,
    };

    open = false;

    constructor(
        @Optional()
        @Self()
        @Inject(NgControl)
        control: NgControl | null,
        @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
        @Inject(ElementRef) private readonly el: ElementRef<HTMLElement>,
        @Inject(TUI_MODE) readonly mode$: Observable<TuiBrightness | null>,
        @Inject(TUI_INPUT_CARD_GROUPED_TEXTS)
        readonly cardGroupedTexts$: Observable<TuiCardGroupedTexts>,
        @Inject(TUI_TEXTFIELD_WATCHED_CONTROLLER)
        readonly controller: TuiTextfieldController,
        @Inject(TUI_INPUT_CARD_GROUPED_OPTIONS) options: TuiInputCardGroupedOptions,
    ) {
        super(control, cdr, options);
    }

    get nativeFocusableElement(): HTMLInputElement | null {
        return this.inputCard ? this.inputCard.nativeElement : null;
    }

    get focused(): boolean {
        return this.open || tuiIsNativeFocusedIn(this.el.nativeElement);
    }

    get appearance(): string {
        return this.controller.appearance;
    }

    get card(): string {
        return this.value?.card || '';
    }

    get expire(): string {
        return this.value?.expire || '';
    }

    get cvc(): string {
        return this.value?.cvc || '';
    }

    get hasCleaner(): boolean {
        return !!this.value?.card?.trim() && !this.readOnly && !this.computedDisabled;
    }

    get hasDropdown(): boolean {
        return !!this.dropdown;
    }

    get placeholderRaised(): boolean {
        return (this.computedFocused && !this.readOnly) || this.hasCardNumber;
    }

    get hasCardNumber(): boolean {
        return !!this.value?.card?.trim();
    }

    get idCard(): string {
        return `${this.id}_card`;
    }

    get idExpire(): string {
        return `${this.id}_expire`;
    }

    get idCVC(): string {
        return `${this.id}_cvc`;
    }

    get isCardCollapsed(): boolean {
        return this.isFocusable(this.card) && !this.cardFocused;
    }

    get autocompleteExpire(): TuiAutofillFieldName {
        return this.autocompleteEnabled ? 'cc-exp' : 'off';
    }

    get autocompleteCVC(): TuiAutofillFieldName {
        return this.autocompleteEnabled ? 'cc-csc' : 'off';
    }

    get tailLength(): number {
        return this.hasExtraSpace ? 5 : 4;
    }

    // Safari expiration date autofill workaround
    get name(): 'ccexpiryyear' | null {
        return this.autocompleteEnabled ? 'ccexpiryyear' : null;
    }

    get cardPrefilled(): boolean {
        return !!this.card.match(TUI_NON_DIGIT_REGEXP);
    }

    get cvcPrefilled(): boolean {
        return !!this.cvc.match(TUI_NON_DIGIT_REGEXP);
    }

    get cardFocusable(): boolean {
        return this.focusable && !this.cardPrefilled;
    }

    get expireFocusable(): boolean {
        return this.isFocusable(this.card) && !this.expireInert;
    }

    get cvcFocusable(): boolean {
        return this.isFocusable(this.card);
    }

    get masked(): string {
        return this.cardPrefilled ? `*${this.card.slice(-4)}` : '*';
    }

    @HostListener('keydown.esc')
    onEsc(): void {
        this.open = false;
    }

    @HostListener('keydown.arrowDown.prevent', ['$event.target', '1'])
    @HostListener('keydown.arrowUp.prevent', ['$event.target', '-1'])
    onArrow(element: HTMLElement, step: number): void {
        this.open = this.hasDropdown;
        this.cdr.detectChanges();
        this.datalist?.onKeyDownArrow(element, step);
    }

    handleOption(option: Partial<TuiCard>): void {
        const {card = '', expire = '', cvc = ''} = option;
        const {bin} = this;
        const element =
            (!expire && this.inputExpire?.nativeElement) || this.inputCVC?.nativeElement;

        this.value = {card, expire, cvc};
        this.updateBin(bin);
        this.open = false;
        this.expireInert = !!expire;

        element?.focus();
    }

    onCardChange(card: string): void {
        const {value, bin} = this;
        const parsed = card.split(' ').join('');

        if (value && value.card === parsed) {
            return;
        }

        this.updateProperty(parsed, 'card');
        this.updateBin(bin);

        if (this.cardValidator(this.card) && !this.expire && this.inputExpire) {
            this.focusExpire();
        }
    }

    onExpireChange(expire: string): void {
        // @bad TODO: Workaround until mask pipe can replace chars and keep caret position
        // @bad TODO: Think about a solution without mask at all
        if (!this.inputExpire) {
            return;
        }

        if (parseInt(expire.slice(0, 2), 10) > 12) {
            expire = `12${expire.slice(2)}`;
        }

        if (expire.startsWith('00')) {
            expire = `01${expire.slice(2)}`;
        }

        this.inputExpire.nativeElement.value = expire;
        this.updateProperty(expire, 'expire');

        if (expire.length === 5) {
            this.focusCVC();
        }
    }

    onCVCChange(cvc: string): void {
        this.updateProperty(cvc, 'cvc');
    }

    transform({offsetWidth}: HTMLSpanElement): string {
        return this.isCardCollapsed ? `translate3d(${offsetWidth}px, 0, 0)` : '';
    }

    onActiveZoneChange(active: boolean): void {
        this.updateFocused(active);
        this.open = active && this.open;
    }

    onMouseDown(event: MouseEvent): void {
        if (tuiIsElement(event.target) && tuiIsInput(event.target)) {
            return;
        }

        event.preventDefault();
        this.focusInput();
    }

    onScroll({currentTarget}: Event): void {
        if (tuiIsElement(currentTarget)) {
            currentTarget.scrollLeft = 0;
        }
    }

    clear(): void {
        this.value = null;
        this.focusCard();
    }

    toggle(): void {
        this.open = !this.open;
    }

    override writeValue(value: TuiCard | null): void {
        const {bin} = this;

        super.writeValue(value);
        this.updateBin(bin);
        this.expireInert = !!this.expire && this.cardPrefilled;
    }

    /** Public API for manual focus management */
    focusCard(): void {
        this.cardNumberAutofocusRef?.focus();
    }

    focusExpire(): void {
        this.expireCardAutofocusRef?.focus();
    }

    focusCVC(): void {
        this.cvcCardAutofocusRef?.focus();
    }

    private get cardFocused(): boolean {
        return !!this.inputCard && tuiIsNativeFocused(this.inputCard.nativeElement);
    }

    private get hasExtraSpace(): boolean {
        return this.card.length % 4 > 0;
    }

    @tuiPure
    private isFocusable(card: string): boolean {
        return this.focusable && (this.cardValidator(card) || this.cardPrefilled);
    }

    private updateBin(oldBin: string | null): void {
        const {bin} = this;

        if (bin !== oldBin && !this.cardPrefilled) {
            this.binChange.emit(bin);
        }
    }

    private updateProperty(value: string, propName: 'card' | 'cvc' | 'expire'): void {
        const {card = '', expire = '', cvc = ''} = this.value || {};
        const newValue: TuiCard = {card, expire, cvc};

        newValue[propName] = value;

        this.value = newValue.expire || newValue.cvc || newValue.card ? newValue : null;
    }

    private focusInput(): void {
        const element =
            (this.cardFocusable && this.inputCard?.nativeElement) ||
            (this.expireFocusable && this.inputExpire?.nativeElement) ||
            this.inputCVC?.nativeElement;

        element?.focus();
    }
}
