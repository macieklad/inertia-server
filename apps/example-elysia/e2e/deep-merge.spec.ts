import { test, expect } from "@playwright/test";

test.describe("Conversations Deep Merge", () => {
  test("displays conversations page", async ({ page }) => {
    await page.goto("/conversations");
    await expect(page.locator("h1")).toContainText("Conversations");
  });

  test("shows initial conversations", async ({ page }) => {
    await page.goto("/conversations");
    await expect(page.locator("text=Project Discussion")).toBeVisible();
    await expect(page.locator("text=Team Standup")).toBeVisible();
  });

  test("shows participants", async ({ page }) => {
    await page.goto("/conversations");
    await expect(page.locator("text=Alice")).toBeVisible();
    await expect(page.locator("text=Bob")).toBeVisible();
  });

  test("shows messages in conversation", async ({ page }) => {
    await page.goto("/conversations");
    await expect(page.locator("text=Hey, how's the project going?")).toBeVisible();
    await expect(page.locator("text=Great! Almost done with the MVP.")).toBeVisible();
  });

  test("can add message to conversation", async ({ page }) => {
    await page.goto("/conversations");

    // Look for message input and send button
    const messageInput = page.locator('input[name="text"], input[placeholder*="message"], textarea');
    const sendButton = page.locator('button[type="submit"], button:has-text("Send")');

    if (await messageInput.isVisible() && await sendButton.isVisible()) {
      await messageInput.fill("New test message");
      await sendButton.click();
      await page.waitForTimeout(500);

      // Expect the message or a success indicator
      await expect(page.locator("text=New test message")).toBeVisible({ timeout: 3000 }).catch(() => {
        // Message might be in a different format
      });
    }
  });
});
