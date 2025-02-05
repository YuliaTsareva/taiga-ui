describe(`MobileCalendar`, () => {
    before(() => {
        cy.clock(Date.UTC(2021, 10, 10), [`Date`]);
    });

    it(`works`, () => {
        cy.viewport(400, 812);
        cy.tuiVisit(`components/mobile-calendar`);

        cy.get(`tui-mobile-calendar-example-1 button`).first().click();
        cy.get(`tui-dialog tui-mobile-calendar`)
            .tuiWaitBeforeAction()
            .matchImageSnapshot(`mobile-calendar`);
    });

    it(`check disabled state`, () => {
        cy.tuiVisit(`components/mobile-calendar/API?tuiMode=null&max$=1`);

        cy.get(`tui-mobile-calendar`)
            .tuiWaitBeforeAction()
            .matchImageSnapshot(`mobile-calendar-disabled`);

        cy.tuiVisit(`components/mobile-calendar/API?tuiMode=null&max$=0`);

        cy.get(`tui-mobile-calendar`)
            .tuiWaitBeforeAction()
            .matchImageSnapshot(`mobile-calendar-enabled`);
    });
});
