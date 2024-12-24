class NotStartedState {
  constructor({ title, status }) {
    this.title = title;
    this.status = status;
  }

  moveToInProgress() {
    this.status = "inProgress";
    console.log(`[status] Görev "${this.title}" inProgress durumuna geçti.`);
  }

  moveToCompleted() {
    console.log("[status] Görev notStarted iken completed durumuna geçemez!");
  }
}

class InProgressState {
  constructor({ title, status }) {
    this.title = title;
    this.status = status;
  }

  moveToCompleted() {
    this.task.status = "completed";
    console.log(`[status] Görev "${this.title}" completed durumuna geçti.`);
  }

  moveToNotStarted() {
    this.task.status = "notStarted";
    console.log(`[status] Görev "${this.title}" notStarted durumuna döndü.`);
  }
}

class CompletedState {
  constructor({ title, status }) {
    this.title = title;
    this.status = status;
  }

  moveToNotStarted() {
    console.log("[status] Completed durumundan notStarted'a geçiş yapılamaz.");
  }

  moveToInProgress() {
    console.log("[status] Completed durumundan inProgress'e geçiş yapılamaz.");
  }
}

module.exports = {
  NotStartedState,
  InProgressState,
  CompletedState,
};
