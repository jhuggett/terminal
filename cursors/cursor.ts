import { Bounds } from "../bounds/bounds";
import { BoxBounds } from "../bounds/box-bounds";
import { Element } from "../elements/element";
import { Point, PointProperties } from "../points/point";
import { Shell } from "../shells/shell";
import { XY, XYSet } from "../xy";

export class OutOfBoundsError extends Error {}

export const border = (cursor: Cursor, character: string) => {
  const bounds = cursor.bounds;
  const properties = cursor.properties;

  try {
    for (let y = 1; y < bounds.height - 1; y++) {
      cursor.moveTo({ x: 0, y });
      cursor.write(character, properties);
      cursor.moveTo({ x: bounds.width - 1, y });
      cursor.write(character, properties);
    }
    cursor.moveToStart();
    cursor.write(character.repeat(bounds.width), properties);
    cursor.moveTo({ x: 0, y: bounds.height - 1 });
    cursor.write(character.repeat(bounds.width), properties);
  } catch (error) {
    if (error instanceof OutOfBoundsError) {
    } else {
      throw error;
    }
  }
};

export class Cursor {
  location: XY = { x: 0, y: 0 };

  constructor(
    public bounds: BoxBounds<any>,
    public element: Element<any>,
    public shell: Shell
  ) {}

  moveUp(amount = 1) {
    const requestedLocation = { ...this.location, y: this.location.y - amount };
    if (this.bounds.relativeWithin(requestedLocation)) {
      this.location = requestedLocation;
    } else {
      throw new OutOfBoundsError("Cannot move cursor up.");
    }
  }

  moveDown(amount = 1) {
    const requestedLocation = { ...this.location, y: this.location.y + amount };
    if (this.bounds.relativeWithin(requestedLocation)) {
      this.location = requestedLocation;
    } else {
      throw new OutOfBoundsError("Cannot move cursor down.");
    }
  }

  moveLeft(amount = 1) {
    const requestedLocation = { ...this.location, x: this.location.x - amount };
    if (this.bounds.relativeWithin(requestedLocation)) {
      this.location = requestedLocation;
    } else {
      throw new OutOfBoundsError("Cannot move cursor left.");
    }
  }

  moveRight(amount = 1) {
    const requestedLocation = { ...this.location, x: this.location.x + amount };
    if (this.bounds.relativeWithin(requestedLocation)) {
      this.location = requestedLocation;
    } else {
      throw new OutOfBoundsError("Cannot move cursor right.");
    }
  }

  moveTo({ x, y }: XY) {
    const requestedLocation = { x, y };
    if (this.bounds.relativeWithin(requestedLocation)) {
      this.location = requestedLocation;
    } else {
      throw new OutOfBoundsError("Cannot move cursor to requested location.");
    }
  }

  carriageReturn() {
    // how does this work for non box bounds?
    this.location = { x: 0, y: this.location.y };
  }

  properties: PointProperties = {};

  private writeCharacter(character: string) {
    const point = new Point(this.bounds.toGlobal(this.location), this.element);

    point.properties = { ...this.properties };
    point.character = character;

    this.shell.setPoint(point);
  }

  moveToStart() {
    // how does this work for non box bounds?
    this.location = { x: 0, y: 0 };
  }

  /**
   * Note: Passed PointProperties will only be applied for this written message.
   * Previous previously set properties will be restored after the message is written.
   */
  write(text: string, properties?: PointProperties) {
    const previousProperties = { ...this.properties };
    if (properties) {
      this.properties = { ...this.properties, ...properties };
    }
    for (let character of text) {
      const globalLocation = this.bounds.toGlobal(this.location);
      this.element.previouslyWrittenPoints.remove(globalLocation);
      this.element.nextWrittenPoints.add(globalLocation);
      this.writeCharacter(character);
      try {
        this.moveRight();
      } catch (error) {
        if (error instanceof OutOfBoundsError) {
          this.moveDown();
          this.carriageReturn();
        } else {
          throw error;
        }
      }
    }
    this.properties = previousProperties;
  }

  fill(text: string) {
    this.moveToStart();
    while (true) {
      try {
        this.write(text);
      } catch (error) {
        if (error instanceof OutOfBoundsError) {
          break;
        } else {
          throw error;
        }
      }
    }
  }
}
