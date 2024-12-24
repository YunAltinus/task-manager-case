class ActiveUserState {
  create() {
    return `User ${this.context.username} is active and can be created.`;
  }

  update() {
    return `User ${this.context.username} is active and can be updated.`;
  }

  delete() {
    return `User ${this.context.username} is active and can be deleted.`;
  }
}

class InactiveUserState {
  create() {
    return `User ${this.context.username} is inactive and cannot be created.`;
  }

  update() {
    return `User ${this.context.username} is inactive and cannot be updated.`;
  }

  delete() {
    return `User ${this.context.username} is inactive and cannot be deleted.`;
  }
}

module.exports = { ActiveUserState, InactiveUserState };
