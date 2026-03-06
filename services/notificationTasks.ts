import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

export const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    if (error) {
      console.log("❌ Background notification task error:", error);
      return;
    }

    try {
      console.log("📩 Background notification task fired");
      console.log("Data:", JSON.stringify(data));
      console.log("Execution info:", executionInfo);
    } catch (e) {
      console.log("❌ Failed inside background notification task:", e);
    }
  }
);

export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log("✅ Background notification task registered");
  } catch (e) {
    console.log("❌ Failed to register background notification task:", e);
  }
}