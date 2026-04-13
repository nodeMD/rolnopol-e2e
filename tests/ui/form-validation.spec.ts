import { test } from '../../src/fixtures/base';
import { RegisterPage } from '../../src/pages/register.page';
import { StaffFieldsPage } from '../../src/pages/staff-fields.page';

test.describe('UI – Form validation', () => {
  test.describe('Registration form', () => {
    test('shows error for invalid email format', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      await test.step('Enter invalid email and submit', async () => {
        await registerPage.register('not-an-email', 'validpass123');
      });

      await test.step('Email format error is shown', async () => {
        await registerPage.expectFieldError('Email', 'valid email');
      });
    });

    test('shows error for password too short', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      await test.step('Enter too-short password and submit', async () => {
        await registerPage.register('valid@example.com', 'ab');
      });

      await test.step('Password length error is shown', async () => {
        await registerPage.expectFieldError('Password', 'characters');
      });
    });
  });

  test.describe('Farm dashboard forms', () => {
    test('field form shows required error for empty name', async ({ authenticatedPage: page }) => {
      const farmPage = new StaffFieldsPage(page);
      await farmPage.goto();
      await farmPage.expectLoaded();

      await test.step('Open field modal and submit without name', async () => {
        await farmPage.openAddFieldModal();
        await farmPage.submitAddFieldForm();
      });

      await test.step('Field name required error is shown', async () => {
        await farmPage.expectFieldError('fieldNameError', 'required');
      });
    });

    test('field form shows error for non-positive area', async ({ authenticatedPage: page }) => {
      const farmPage = new StaffFieldsPage(page);
      await farmPage.goto();
      await farmPage.expectLoaded();

      await test.step('Open field modal, enter zero area and submit', async () => {
        await farmPage.openAddFieldModal();
        await page.locator('#fieldName').fill('Valid Name');
        await page.locator('#fieldArea').fill('0');
        await farmPage.submitAddFieldForm();
      });

      await test.step('Area validation error is shown', async () => {
        await farmPage.expectFieldError('fieldAreaError', 'positive');
      });
    });

    test('staff form shows required errors for empty name and surname', async ({
      authenticatedPage: page,
    }) => {
      const farmPage = new StaffFieldsPage(page);
      await farmPage.goto();
      await farmPage.expectLoaded();

      await test.step('Open staff modal and submit without name or surname', async () => {
        await farmPage.openAddStaffModal();
        await farmPage.submitAddStaffForm();
      });

      await test.step('Name and surname required errors are shown', async () => {
        await farmPage.expectStaffError('staffNameError', 'required');
        await farmPage.expectStaffError('staffSurnameError', 'required');
      });
    });

    test('staff form shows error for age out of range', async ({ authenticatedPage: page }) => {
      const farmPage = new StaffFieldsPage(page);
      await farmPage.goto();
      await farmPage.expectLoaded();

      await test.step('Open staff modal, enter invalid age and submit', async () => {
        await farmPage.openAddStaffModal();
        await page.locator('#staffName').fill('Anna');
        await page.locator('#staffSurname').fill('Kowalska');
        await page.locator('#staffAge').fill('200');
        await farmPage.submitAddStaffForm();
      });

      await test.step('Age range error is shown', async () => {
        await farmPage.expectStaffError('staffAgeError', 'between 1 and 120');
      });
    });

    test('animal form shows error for non-positive amount', async ({ authenticatedPage: page }) => {
      const farmPage = new StaffFieldsPage(page);
      await farmPage.goto();
      await farmPage.expectLoaded();

      await test.step('Open animal modal, enter zero amount and submit', async () => {
        await farmPage.openAddAnimalModal();
        await page.locator('#animalAmount').fill('0');
        await farmPage.submitAddAnimalForm();
      });

      await test.step('Amount validation error is shown', async () => {
        await farmPage.expectAnimalError('animalAmountError', 'positive');
      });
    });
  });
});
