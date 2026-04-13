import { makeUniqueUser } from '../../data/builders';
import { ApiClient } from '../../src/api/client';
import { expect, test } from '../../src/fixtures/base';
import { LoginPage } from '../../src/pages/login.page';
import { RegisterPage } from '../../src/pages/register.page';
import { StaffFieldsPage } from '../../src/pages/staff-fields.page';

// There is a bug in the app that it fails to authenticate user on Safari browser 🐛
test.describe('UI E2E – Register and Set Up Farm', () => {
  test('registers via UI, logs in, adds field/animal/staff, assigns staff to field', async ({
    page,
    request,
  }) => {
    const user = makeUniqueUser({ displayedName: 'E2E Farmer' });
    const fieldName = `E2E Field ${Date.now()}`;
    const staffFirstName = 'Anna';
    const staffSurname = 'Kowalska';
    let token: string | undefined;

    try {
      await test.step('Register via UI', async () => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.register(user.email, user.password, user.displayedName);
        await registerPage.expectRedirectAfterRegister();
      });

      await test.step('Log in', async () => {
        const loginPage = new LoginPage(page);
        await loginPage.login(user.email, user.password);
        const cookies = await page.context().cookies();
        token = cookies.find((c) => c.name === 'rolnopolToken')?.value;
        expect(token).toBeTruthy();
      });

      const farmPage = new StaffFieldsPage(page);

      await test.step('Navigate to farm dashboard', async () => {
        await farmPage.openStaffFieldsDashboard();
        await farmPage.expectLoaded();
      });

      await test.step('Add a field', async () => {
        await farmPage.addField(fieldName, 15);
      });

      await test.step('Add an animal', async () => {
        await farmPage.addAnimal('cow', 4);
      });

      await test.step('Add a staff member', async () => {
        await farmPage.addStaff(staffFirstName, staffSurname, 28);
      });

      await test.step('Assign staff to field', async () => {
        await farmPage.openTab('Assign');
        await farmPage.assignStaffToField(`${staffFirstName} ${staffSurname}`, fieldName);
      });

      await test.step('Assert all resources are visible', async () => {
        await farmPage.openTab('Main');
        await farmPage.expectFieldVisible(fieldName);
        await farmPage.expectAnimalVisible('cow');
        await farmPage.expectStaffVisible(staffFirstName);
      });
    } finally {
      if (token) {
        await new ApiClient(request, token).deleteProfile().catch(() => {});
      }
    }
  });
});
