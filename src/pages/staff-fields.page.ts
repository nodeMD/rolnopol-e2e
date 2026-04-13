import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class StaffFieldsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/staff-fields-main.html');
  }

  async openStaffFieldsDashboard(): Promise<void> {
    await this.page.getByTestId('nav-staff-fields').click();
    await this.page.waitForLoadState('load');
  }

  async openTab(tabName: 'Main' | 'Assign' | 'Charts'): Promise<void> {
    await this.page.getByRole('link', { name: tabName }).click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('#openAddFieldModal')).toBeVisible({ timeout: 10_000 });
  }

  // ── Fields ──────────────────────────────────────────────────────────────

  async addField(name: string, area: number): Promise<void> {
    await this.page.locator('#openAddFieldModal').click();
    await this.page.locator('#fieldName').fill(name);
    await this.page.locator('#fieldArea').fill(String(area));
    await this.page
      .locator('#addFieldModal')
      .getByRole('button', { name: /Add Field/i })
      .click();
    await this.expectFieldVisible(name);
  }

  async expectFieldVisible(name: string): Promise<void> {
    await expect(this.page.locator('#fieldsList')).toContainText(name, { timeout: 8_000 });
  }

  // ── Staff ────────────────────────────────────────────────────────────────

  async addStaff(name: string, surname: string, age: number): Promise<void> {
    await this.page.locator('#openAddStaffModal').click();
    await this.page.locator('#staffName').fill(name);
    await this.page.locator('#staffSurname').fill(surname);
    await this.page.locator('#staffAge').fill(String(age));
    await this.page
      .locator('#addStaffModal')
      .getByRole('button', { name: /Add Staff/i })
      .click();
    await this.expectStaffVisible(name);
  }

  async expectStaffVisible(name: string): Promise<void> {
    await expect(this.page.locator('#staffList')).toContainText(name, { timeout: 8_000 });
  }

  // ── Animals ──────────────────────────────────────────────────────────────

  async addAnimal(type: string, amount: number): Promise<void> {
    await this.page.locator('#openAddAnimalModal').click();
    await this.page.locator('#animalType').selectOption(type);
    await this.page.locator('#animalAmount').fill(String(amount));
    await this.page
      .locator('#addAnimalModal')
      .getByRole('button', { name: /Add Animal/i })
      .click();
    await this.expectAnimalVisible(type);
  }

  async expectAnimalVisible(type: string): Promise<void> {
    await expect(this.page.locator('#animalsList')).toContainText(type, { timeout: 8_000 });
  }

  // ── Assignments ──────────────────────────────────────────────────────────

  async assignStaffToField(staffName: string, fieldName: string): Promise<void> {
    await this.page.locator('#openAssignModal').click();
    // selects are populated dynamically — wait for at least one option to appear
    await expect(this.page.locator('#assignField option').first()).toBeAttached({ timeout: 5_000 });
    const fieldValue = await this.page
      .locator('#assignField option')
      .filter({ hasText: fieldName })
      .first()
      .getAttribute('value');
    if (fieldValue === null) throw new Error(`Field option not found: ${fieldName}`);
    await this.page.locator('#assignField').selectOption({ value: fieldValue });
    await this.page.locator('#assignStaff').selectOption({ label: staffName });
    await this.page
      .locator('#assignModal')
      .getByRole('button', { name: /Assign/i })
      .click();
  }

  // ── Validation helpers ───────────────────────────────────────────────────

  async openAddFieldModal(): Promise<void> {
    await this.page.locator('#openAddFieldModal').click();
  }

  async submitAddFieldForm(): Promise<void> {
    await this.page
      .locator('#addFieldModal')
      .getByRole('button', { name: /Add Field/i })
      .click();
  }

  async expectFieldError(id: 'fieldNameError' | 'fieldAreaError', message: string): Promise<void> {
    await expect(this.page.locator(`#${id}`)).toContainText(message, { timeout: 5_000 });
  }

  async openAddStaffModal(): Promise<void> {
    await this.page.locator('#openAddStaffModal').click();
  }

  async submitAddStaffForm(): Promise<void> {
    await this.page
      .locator('#addStaffModal')
      .getByRole('button', { name: /Add Staff/i })
      .click();
  }

  async expectStaffError(
    id: 'staffNameError' | 'staffSurnameError' | 'staffAgeError',
    message: string,
  ): Promise<void> {
    await expect(this.page.locator(`#${id}`)).toContainText(message, { timeout: 5_000 });
  }

  async openAddAnimalModal(): Promise<void> {
    await this.page.locator('#openAddAnimalModal').click();
  }

  async submitAddAnimalForm(): Promise<void> {
    await this.page
      .locator('#addAnimalModal')
      .getByRole('button', { name: /Add Animal/i })
      .click();
  }

  async expectAnimalError(
    id: 'animalTypeError' | 'animalAmountError',
    message: string,
  ): Promise<void> {
    await expect(this.page.locator(`#${id}`)).toContainText(message, { timeout: 5_000 });
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  async expectFieldsCount(count: number): Promise<void> {
    await expect(this.page.locator('#fieldsStats')).toContainText(String(count), {
      timeout: 8_000,
    });
  }

  async expectStaffCount(count: number): Promise<void> {
    await expect(this.page.locator('#staffStats')).toContainText(String(count), { timeout: 8_000 });
  }

  async expectAnimalsCount(count: number): Promise<void> {
    await expect(this.page.locator('#animalsStats')).toContainText(String(count), {
      timeout: 8_000,
    });
  }
}
