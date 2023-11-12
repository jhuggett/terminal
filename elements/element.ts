import { Bounds } from "../bounds/bounds.ts";
import { BoxBounds } from "../bounds/box-bounds.ts";
import { Cursor } from "../cursors/cursor.ts";
import { Point } from "../points/point.ts";
import { Shell } from "../shells/shell.ts";
import { SubscribableEvent, Subscription } from "../subscribable-event.ts";
import { TargetCallback, TargetKey, TargetMap } from "../user-input.ts";
import { XY, XYSet } from "../xy.ts";

export class OutOfBoundsError extends Error {
  constructor(msg: string, public axis: "x" | "y") {
    super(msg);
  }
}

export class Element<Properties> {
  id: number;

  _cachedZ?: number;
  calculateZ: () => number = () => 0;
  recalculateZ() {
    const updatedZ = this.calculateZ();
    if (updatedZ !== this._cachedZ) {
      this._cachedZ = updatedZ;
      this.onZChanged.emit(this);
    }
  }

  get z() {
    if (this._cachedZ === undefined) {
      this._cachedZ = this.calculateZ();
    }
    return this._cachedZ;
  }

  onZChanged = new SubscribableEvent<Element<Properties>>();

  parent?: Element<unknown>;

  previouslyWrittenPoints: XYSet = new XYSet([]);
  nextWrittenPoints: XYSet = new XYSet([]);

  isFocused = false;

  /*
  We need to know:
  - what has been written
  - what has been overwritten

  so that we can clear what has been previous written (but not overwritten)
  and now say what was overwritten is the new written
  */

  renderer?: (_: {
    cursor: Cursor;
    bounds: BoxBounds<Properties>;
    properties: Properties;
  }) => void;
  render() {
    this.renderer?.({
      cursor: this.newCursor(),
      bounds: this.bounds,
      properties: this.properties,
    });
    for (const xy of this.previouslyWrittenPoints.coordinates) {
      this.shell.removeElementAtXY(xy, this);
    }
    this.previouslyWrittenPoints = new XYSet([
      ...this.nextWrittenPoints.coordinates,
    ]);
    this.nextWrittenPoints = new XYSet([]);
  }

  newCursor() {
    return new Cursor(this.bounds, this, this.shell);
  }

  subscriptions: Subscription[] = [];
  onParentZChangedSubscription?: Subscription;

  constructor(
    public shell: Shell,
    public bounds: BoxBounds<Properties>,
    public properties: Properties,
    parent?: Element<any>
  ) {
    const { id } = shell.registerElement(this);
    this.id = id;

    this.parent = parent;

    if (this.parent) {
      this.moveInFrontOf(this.parent);

      this.subscriptions.push(
        this.parent?.bounds.onRecalculate.subscribe(() => {
          this.bounds.recalculate(this.properties);
        }),
        this.parent?.onDestroy.subscribe(() => {
          this.destroy();
        })
      );
    }

    this.subscriptions.push(
      this.bounds.onRecalculate.subscribe(() => {
        this.render();
      })
    );
    this.subscriptions.push(
      this.onZChanged.subscribe(() => {
        this.render();
      })
    );
    this.subscriptions.push(
      this.onFocus.subscribe(() => {
        this.isFocused = true;
      })
    );
    this.subscriptions.push(
      this.onBlur.subscribe(() => {
        this.isFocused = false;
      })
    );
  }

  /**
   * Sets Z to be one more than the element passed in.
   * Subscribes to the element's Z changes, and recalculates Z when they change.
   */
  moveInFrontOf(element: Element<any>) {
    if (this.onParentZChangedSubscription) {
      this.onParentZChangedSubscription.unsubscribe();
    }
    this.calculateZ = () => {
      return element.z + 1;
    };
    this.onParentZChangedSubscription = element.onZChanged.subscribe(() => {
      this.recalculateZ();
    });
    this.recalculateZ();
  }

  inputMap: TargetMap = new TargetMap();
  on<T extends TargetKey>(key: T, callback: TargetCallback<T>) {
    this.inputMap.on(key, callback);
  }
  clearEvents() {
    this.inputMap = new TargetMap();
  }

  onFocus = new SubscribableEvent<Element<Properties>>();
  onBlur = new SubscribableEvent<Element<Properties>>();

  clear() {
    this.shell.removeAllPointsForElement(this);
  }

  clearThisAndEverythingAbove() {
    /*
      For some reason this notably slows down processing on large
      windows, far after this method should end.

      TODO: figure out why (currently at a complete loss)
    */

    this.shell.clearWithinBounds(this.bounds, this.z);
  }

  createChildElement<ChildProperties>(
    globalBounds: (props: ChildProperties) => { start: XY; end: XY },
    props: ChildProperties
  ) {
    return new Element<ChildProperties>(
      this.shell,
      new BoxBounds(globalBounds, props),
      props,
      this
    );
  }

  recalculateBounds() {
    this.bounds.recalculate(this.properties);
  }

  reactivelyUpdateProperties(
    setter: (props: Properties) => Partial<Properties>,
    recalculateBounds = false
  ) {
    this.properties = { ...this.properties, ...setter(this.properties) };
    if (recalculateBounds) this.recalculateBounds();
    else this.render();
  }

  onDestroy = new SubscribableEvent<Element<Properties>>();

  destroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.onDestroy.emit(this);
  }

  destroyChildren() {
    this.onDestroy.emit(this);
  }

  focus() {
    this.shell.focusOn(this);
  }
}
