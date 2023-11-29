export class SubscribableEvent<Payload> {
  subscriptions: ((payload: Payload) => void | "unsubscribe")[] = [];

  emit(payload: Payload) {
    this.subscriptions = this.subscriptions.filter(
      (s) => s(payload) !== "unsubscribe"
    );
  }

  subscribe(
    subscription: (payload: Payload) => void | "unsubscribe"
  ): Subscription {
    this.subscriptions.push(subscription);
    return {
      unsubscribe: () => {
        this.subscriptions = this.subscriptions.filter(
          (s) => s !== subscription
        );
      },
    };
  }
}

export interface Subscription {
  unsubscribe: () => void;
}

export class SubscriptionManager {
  subscriptions: Subscription[] = [];

  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  unsubscribe(subscription: Subscription) {
    this.subscriptions = this.subscriptions.filter((s) => {
      if (s === subscription) {
        s.unsubscribe();
        return false;
      }
      return true;
    });
  }

  add(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  addMultiple(subscriptions: Subscription[]) {
    subscriptions.forEach((subscription) => {
      this.add(subscription);
    });
  }
}
