export class SubscribableEvent<Payload> {
  subscriptions: ((payload: Payload) => void)[] = [];

  emit(payload: Payload) {
    this.subscriptions.forEach((s) => s(payload));
  }

  subscribe(subscription: (payload: Payload) => void): Subscription {
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
